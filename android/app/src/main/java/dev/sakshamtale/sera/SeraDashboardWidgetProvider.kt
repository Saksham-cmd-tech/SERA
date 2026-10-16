package dev.sakshamtale.sera

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews

class SeraDashboardWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.sera_widget_dashboard)
            val data = SeraWidgetData.getWidgetData(context)

            val netWorth = data.optString("netWorth", "₹0")
            val monthSpent = data.optString("monthSpent", "₹0")
            val tx1Name = data.optString("tx1Name", "No recent transactions")
            val tx1Amt = data.optString("tx1Amt", "")
            val tx2Name = data.optString("tx2Name", "")
            val tx2Amt = data.optString("tx2Amt", "")

            views.setTextViewText(R.id.widget_dash_net_worth, netWorth)
            views.setTextViewText(R.id.widget_dash_spent, monthSpent)
            views.setTextViewText(R.id.widget_dash_tx_name_1, tx1Name)
            views.setTextViewText(R.id.widget_dash_tx_amt_1, tx1Amt)
            if (tx1Amt.startsWith("+")) {
                views.setTextColor(R.id.widget_dash_tx_amt_1, android.graphics.Color.parseColor("#34D399"))
            } else {
                views.setTextColor(R.id.widget_dash_tx_amt_1, android.graphics.Color.parseColor("#EB3B2E"))
            }

            views.setTextViewText(R.id.widget_dash_tx_name_2, tx2Name)
            views.setTextViewText(R.id.widget_dash_tx_amt_2, tx2Amt)
            if (tx2Amt.startsWith("+")) {
                views.setTextColor(R.id.widget_dash_tx_amt_2, android.graphics.Color.parseColor("#34D399"))
            } else {
                views.setTextColor(R.id.widget_dash_tx_amt_2, android.graphics.Color.parseColor("#EB3B2E"))
            }

            // Tap root -> open app
            val openAppIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val openAppPendingIntent = PendingIntent.getActivity(
                context,
                500,
                openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_dashboard_root, openAppPendingIntent)

            // + Expense
            val expenseIntent = Intent(Intent.ACTION_VIEW, Uri.parse("sera://add-expense")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val expensePendingIntent = PendingIntent.getActivity(
                context,
                501,
                expenseIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_dash_expense, expensePendingIntent)

            // + Income
            val incomeIntent = Intent(Intent.ACTION_VIEW, Uri.parse("sera://add-income")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val incomePendingIntent = PendingIntent.getActivity(
                context,
                502,
                incomeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_dash_income, incomePendingIntent)

            // ⇄ Transfer
            val transferIntent = Intent(Intent.ACTION_VIEW, Uri.parse("sera://add-transfer")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val transferPendingIntent = PendingIntent.getActivity(
                context,
                503,
                transferIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_dash_transfer, transferPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        fun updateAll(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val ids = appWidgetManager.getAppWidgetIds(
                ComponentName(context, SeraDashboardWidgetProvider::class.java)
            )
            for (id in ids) {
                updateWidget(context, appWidgetManager, id)
            }
        }
    }
}
