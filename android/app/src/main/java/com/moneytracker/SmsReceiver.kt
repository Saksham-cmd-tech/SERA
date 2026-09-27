package com.moneytracker

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.net.Uri
import android.provider.Telephony
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.Arguments
import java.net.URLEncoder

class SmsReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (Telephony.Sms.Intents.SMS_RECEIVED_ACTION != action) {
            return
        }

        val prefs = context.getSharedPreferences(SmsModule.PREFS_NAME, Context.MODE_PRIVATE)
        val isEnabled = prefs.getBoolean(SmsModule.KEY_ENABLED, true)
        if (!isEnabled) {
            return
        }

        try {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            if (messages.isNullOrEmpty()) {
                return
            }

            val fullBody = StringBuilder()
            var sender = ""

            for (msg in messages) {
                fullBody.append(msg.displayMessageBody ?: msg.messageBody ?: "")
                if (sender.isEmpty()) {
                    sender = msg.displayOriginatingAddress ?: msg.originatingAddress ?: ""
                }
            }

            val body = fullBody.toString()
            processFinancialSms(context, body, sender)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    companion object {
        fun processFinancialSms(context: Context, body: String, sender: String) {
            val lower = body.lowercase()

            // 1. Filter out pure OTP messages unless they contain clear debit/credit terms
            val isOtp = lower.contains("otp") || lower.contains("verification code") || lower.contains("security code")
            val hasMovement = lower.contains("debited") || lower.contains("debit") ||
                    lower.contains("spent") || lower.contains("paid") ||
                    lower.contains("credited") || lower.contains("credit") ||
                    lower.contains("sent") || lower.contains("purchase")

            if (isOtp && !hasMovement) {
                return
            }

            // 2. Must contain at least one movement or transaction keyword
            val isFinancial = hasMovement || lower.contains("withdrawn") ||
                    lower.contains("transferred") || lower.contains("txn") ||
                    lower.contains("vpa") || lower.contains("upi") ||
                    lower.contains("refund") || lower.contains("salary")

            if (!isFinancial) {
                return
            }

            // 3. Determine transaction type (expense vs income)
            val isIncome = (lower.contains("credited") || lower.contains("credit") ||
                    lower.contains("deposited") || lower.contains("received") ||
                    lower.contains("refund") || lower.contains("salary")) &&
                    !lower.contains("debited") && !lower.contains("spent")
            val type = if (isIncome) "income" else "expense"

            // 4. Extract Amount
            val amountRegexes = listOf(
                Regex("""(?:rs\.?|inr|₹|\$)\s*([0-9,]+(?:\.[0-9]{1,2})?)""", RegexOption.IGNORE_CASE),
                Regex("""(?:spent|debited|paid|credited|purchase of|sent|amount of)\s*(?:rs\.?|inr|₹|\$)?\s*([0-9,]+(?:\.[0-9]{1,2})?)""", RegexOption.IGNORE_CASE),
                Regex("""([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rs\.?|inr|₹)""", RegexOption.IGNORE_CASE)
            )

            var parsedAmount: Double? = null
            var amountStr = ""

            for (pattern in amountRegexes) {
                val match = pattern.find(body)
                if (match != null && match.groupValues.size > 1) {
                    val rawNum = match.groupValues[1].replace(",", "").trim()
                    val num = rawNum.toDoubleOrNull()
                    if (num != null && num > 0) {
                        parsedAmount = num
                        amountStr = if (num % 1.0 == 0.0) num.toLong().toString() else String.format("%.2f", num)
                        break
                    }
                }
            }

            if (parsedAmount == null || parsedAmount <= 0) {
                return
            }

            // 5. Extract Merchant / Payee
            var merchant = ""
            val merchantPatterns = listOf(
                Regex("""(?:to|towards|at|for|vpa)\s+([A-Za-z0-9\s&.\-_]{2,30}?)(?:\s+(?:on|ref|upi|txn|by|via|avail|bal|card|a\/c|ending|\.|\,)|$)""", RegexOption.IGNORE_CASE),
                Regex("""transfer to\s+([A-Za-z0-9\s&.\-_]{2,30}?)(?:\s+(?:on|ref|upi|txn|by|via|\.|\,)|$)""", RegexOption.IGNORE_CASE),
                Regex("""(?:info:?|ref:?)\s*([A-Za-z0-9\s&.\-_]{2,25})""", RegexOption.IGNORE_CASE)
            )

            for (p in merchantPatterns) {
                val m = p.find(body)
                if (m != null && m.groupValues.size > 1) {
                    val candidate = m.groupValues[1].trim()
                    val lowerCand = candidate.lowercase()
                    if (!lowerCand.contains("your a/c") && !lowerCand.contains("account") &&
                        !lowerCand.startsWith("rs") && !lowerCand.startsWith("inr") &&
                        candidate.length >= 2) {
                        merchant = candidate
                        break
                    }
                }
            }

            if (merchant.isEmpty()) {
                merchant = when {
                    sender.contains("HDFC", ignoreCase = true) -> "HDFC Card/UPI"
                    sender.contains("SBI", ignoreCase = true) -> "SBI Card/UPI"
                    sender.contains("ICICI", ignoreCase = true) -> "ICICI Card/UPI"
                    sender.contains("AXIS", ignoreCase = true) -> "Axis Bank"
                    sender.contains("KOTAK", ignoreCase = true) -> "Kotak Bank"
                    sender.contains("PAYTM", ignoreCase = true) -> "Paytm"
                    sender.contains("CHASE", ignoreCase = true) -> "Chase Bank"
                    else -> if (type == "income") "Direct Credit" else "Card / UPI Debit"
                }
            }

            // 6. Map Category
            val lowerMerchant = (merchant + " " + body).lowercase()
            val categoryId = when {
                lowerMerchant.contains("swiggy") || lowerMerchant.contains("zomato") ||
                        lowerMerchant.contains("mcdonald") || lowerMerchant.contains("starbucks") ||
                        lowerMerchant.contains("subway") || lowerMerchant.contains("kfc") ||
                        lowerMerchant.contains("burger") || lowerMerchant.contains("cafe") ||
                        lowerMerchant.contains("restaurant") || lowerMerchant.contains("food") ||
                        lowerMerchant.contains("dining") -> "cat-food"

                lowerMerchant.contains("uber") || lowerMerchant.contains("ola") ||
                        lowerMerchant.contains("rapido") || lowerMerchant.contains("metro") ||
                        lowerMerchant.contains("fuel") || lowerMerchant.contains("petrol") ||
                        lowerMerchant.contains("indianoil") || lowerMerchant.contains("shell") ||
                        lowerMerchant.contains("irctc") || lowerMerchant.contains("transport") -> "cat-transport"

                lowerMerchant.contains("blinkit") || lowerMerchant.contains("zepto") ||
                        lowerMerchant.contains("instamart") || lowerMerchant.contains("bigbasket") ||
                        lowerMerchant.contains("grocery") || lowerMerchant.contains("supermarket") ||
                        lowerMerchant.contains("dmart") -> "cat-groceries"

                lowerMerchant.contains("amazon") || lowerMerchant.contains("flipkart") ||
                        lowerMerchant.contains("myntra") || lowerMerchant.contains("ajio") ||
                        lowerMerchant.contains("zara") || lowerMerchant.contains("shopping") -> "cat-shopping"

                lowerMerchant.contains("netflix") || lowerMerchant.contains("spotify") ||
                        lowerMerchant.contains("hotstar") || lowerMerchant.contains("prime") ||
                        lowerMerchant.contains("movie") || lowerMerchant.contains("cinema") ||
                        lowerMerchant.contains("pvr") -> "cat-entertainment"

                lowerMerchant.contains("electricity") || lowerMerchant.contains("bescom") ||
                        lowerMerchant.contains("airtel") || lowerMerchant.contains("jio") ||
                        lowerMerchant.contains("vi") || lowerMerchant.contains("bill") ||
                        lowerMerchant.contains("recharge") || lowerMerchant.contains("broadband") -> "cat-bills"

                type == "income" -> "cat-income-salary"

                else -> "cat-food"
            }

            // 7. Ensure notification channel exists
            NotificationModule.createChannels(context)

            // 8. Build notification
            val notifId = (System.currentTimeMillis() % 100000).toInt()
            val currencySymbol = "₹"
            val titleText = if (type == "income") {
                "SERA • Add Income: $currencySymbol$amountStr?"
            } else {
                "SERA • Add Expense: $currencySymbol$amountStr?"
            }
            val contentText = "$merchant ($currencySymbol$amountStr) • Tap to add to SERA"

            val encodedMerchant = try { URLEncoder.encode(merchant, "UTF-8") } catch (e: Exception) { merchant }
            val encodedNote = try { URLEncoder.encode("Auto-detected SMS", "UTF-8") } catch (e: Exception) { "Auto-detected" }
            val deepLinkPath = if (type == "income") "add-income" else "add-expense"
            val deepLinkUri = Uri.parse("sera://$deepLinkPath?amount=$amountStr&merchant=$encodedMerchant&type=$type&category=$categoryId&note=$encodedNote&autoPrompt=true")

            val tapIntent = Intent(Intent.ACTION_VIEW, deepLinkUri, context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingTapIntent = PendingIntent.getActivity(
                context,
                notifId,
                tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val dismissIntent = Intent(context, SmsActionReceiver::class.java).apply {
                action = SmsActionReceiver.ACTION_DISMISS
                putExtra(SmsActionReceiver.EXTRA_NOTIFICATION_ID, notifId)
            }
            val pendingDismissIntent = PendingIntent.getBroadcast(
                context,
                notifId + 100000,
                dismissIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val actionAddTitle = if (type == "income") "ADD INCOME" else "ADD EXPENSE"

            val largeIcon = try {
                BitmapFactory.decodeResource(context.resources, R.mipmap.ic_launcher_round)
            } catch (e: Exception) {
                null
            }

            val builder = NotificationCompat.Builder(context, NotificationModule.CHANNEL_SMS_ALERTS)
                .setSmallIcon(R.mipmap.ic_launcher_round)
                .setContentTitle(titleText)
                .setContentText(contentText)
                .setStyle(
                    NotificationCompat.BigTextStyle()
                        .bigText("$merchant ($currencySymbol$amountStr)\nDetected from bank SMS alert. Would you like to record this into SERA?")
                )
                .setSubText("SERA SMS AUTO-DETECT")
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingTapIntent)
                .addAction(
                    R.mipmap.ic_launcher_round,
                    actionAddTitle,
                    pendingTapIntent
                )
                .addAction(
                    android.R.drawable.ic_menu_close_clear_cancel,
                    "DISMISS",
                    pendingDismissIntent
                )

            if (largeIcon != null) {
                builder.setLargeIcon(largeIcon)
            }

            val notificationManager =
                context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(notifId, builder.build())

            // 9. Emit event to React Native JS if active
            try {
                val eventData = Arguments.createMap().apply {
                    putDouble("amount", parsedAmount)
                    putString("amountStr", amountStr)
                    putString("merchant", merchant)
                    putString("type", type)
                    putString("categoryId", categoryId)
                    putString("rawText", body)
                }
                SmsEventEmitter.emitEvent("onSmsTransactionDetected", eventData)
            } catch (e: Exception) {
                // Ignore JS context error
            }
        }
    }
}
