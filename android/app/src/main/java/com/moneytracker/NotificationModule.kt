package com.moneytracker

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.*
import java.util.Calendar

class NotificationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NotificationModule"

    init {
        createChannels(reactContext)
    }

    @ReactMethod
    fun initChannels(promise: Promise) {
        try {
            createChannels(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun areNotificationsEnabled(promise: Promise) {
        try {
            val enabled = NotificationManagerCompat.from(reactContext).areNotificationsEnabled()
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.reject("CHECK_ERROR", e.message)
        }
    }

    @ReactMethod
    fun sendNotification(options: ReadableMap, promise: Promise) {
        try {
            val title = if (options.hasKey("title")) options.getString("title") else "SERA"
            val message = if (options.hasKey("message")) options.getString("message") else ""
            val channelId = if (options.hasKey("channelId")) options.getString("channelId") else CHANNEL_ALERTS
            val id = if (options.hasKey("id")) options.getInt("id") else (System.currentTimeMillis() % 100000).toInt()

            val targetChannel = channelId ?: CHANNEL_ALERTS

            val tapIntent = Intent(reactContext, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }

            val pendingIntent = PendingIntent.getActivity(
                reactContext,
                id,
                tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val largeIcon = try {
                BitmapFactory.decodeResource(reactContext.resources, R.mipmap.ic_launcher_round)
            } catch (e: Exception) {
                null
            }

            val builder = NotificationCompat.Builder(reactContext, targetChannel)
                .setSmallIcon(R.mipmap.ic_launcher_round)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(NotificationCompat.BigTextStyle().bigText(message))
                .setSubText("SERA")
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent)

            if (largeIcon != null) {
                builder.setLargeIcon(largeIcon)
            }

            val notificationManager =
                reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(id, builder.build())

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SEND_ERROR", e.message)
        }
    }

    @ReactMethod
    fun scheduleDailyReminder(hour: Int, minute: Int, promise: Promise) {
        try {
            scheduleReminderInternal(reactContext, hour, minute)
            val prefs = reactContext.getSharedPreferences(NotificationReceiver.PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit()
                .putBoolean(NotificationReceiver.KEY_REMINDER_ENABLED, true)
                .putInt(NotificationReceiver.KEY_REMINDER_HOUR, hour)
                .putInt(NotificationReceiver.KEY_REMINDER_MINUTE, minute)
                .apply()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SCHEDULE_ERROR", e.message)
        }
    }

    @ReactMethod
    fun cancelDailyReminder(promise: Promise) {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(reactContext, NotificationReceiver::class.java).apply {
                action = NotificationReceiver.ACTION_ALARM
            }
            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                REMINDER_REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.cancel(pendingIntent)

            val prefs = reactContext.getSharedPreferences(NotificationReceiver.PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putBoolean(NotificationReceiver.KEY_REMINDER_ENABLED, false).apply()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CANCEL_ERROR", e.message)
        }
    }

    @ReactMethod
    fun cancelNotification(id: Int, promise: Promise) {
        try {
            val notificationManager =
                reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.cancel(id)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CANCEL_ERROR", e.message)
        }
    }

    @ReactMethod
    fun cancelAllNotifications(promise: Promise) {
        try {
            val notificationManager =
                reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.cancelAll()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CANCEL_ALL_ERROR", e.message)
        }
    }

    companion object {
        const val CHANNEL_ALERTS = "sera_budget_alerts"
        const val CHANNEL_REMINDERS = "sera_daily_reminders"
        const val CHANNEL_GENERAL = "sera_general"
        const val CHANNEL_SMS_ALERTS = "sera_sms_alerts"
        const val REMINDER_REQUEST_CODE = 9001

        fun createChannels(context: Context) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val notificationManager =
                    context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

                val alertsChannel = NotificationChannel(
                    CHANNEL_ALERTS,
                    "SERA Budget & Overrun Alerts",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Alerts when budget thresholds are exceeded"
                    enableVibration(true)
                    vibrationPattern = longArrayOf(0, 250, 150, 250)
                }

                val smsChannel = NotificationChannel(
                    CHANNEL_SMS_ALERTS,
                    "SERA SMS Expense Detection",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Notifications for detected bank and UPI SMS transactions"
                    enableVibration(true)
                    vibrationPattern = longArrayOf(0, 250, 150, 250)
                }

                val remindersChannel = NotificationChannel(
                    CHANNEL_REMINDERS,
                    "SERA Daily Reminders",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Daily evening reminder to record expenses"
                    enableVibration(true)
                }

                val generalChannel = NotificationChannel(
                    CHANNEL_GENERAL,
                    "SERA General & Updates",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "General financial summaries and milestone updates"
                }

                notificationManager.createNotificationChannel(alertsChannel)
                notificationManager.createNotificationChannel(smsChannel)
                notificationManager.createNotificationChannel(remindersChannel)
                notificationManager.createNotificationChannel(generalChannel)
            }
        }

        fun scheduleReminderInternal(context: Context, hour: Int, minute: Int) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            val intent = Intent(context, NotificationReceiver::class.java).apply {
                action = NotificationReceiver.ACTION_ALARM
                putExtra(NotificationReceiver.EXTRA_TITLE, "SERA • Daily Expense Reminder")
                putExtra(
                    NotificationReceiver.EXTRA_MESSAGE,
                    "Take 30 seconds to record today's spending and keep your budget intentional."
                )
                putExtra(NotificationReceiver.EXTRA_CHANNEL_ID, CHANNEL_REMINDERS)
                putExtra(NotificationReceiver.EXTRA_ID, 1001)
            }

            val pendingIntent = PendingIntent.getBroadcast(
                context,
                REMINDER_REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val calendar = Calendar.getInstance().apply {
                timeInMillis = System.currentTimeMillis()
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)

                if (timeInMillis <= System.currentTimeMillis()) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
            } else {
                alarmManager.setRepeating(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    AlarmManager.INTERVAL_DAY,
                    pendingIntent
                )
            }
        }
    }
}
