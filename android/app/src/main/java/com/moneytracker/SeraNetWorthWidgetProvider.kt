package com.moneytracker

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews

class SeraNetWorthWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.sera_widget_net_worth)
            val data = SeraWidgetData.getWidgetData(context)

            val netWorth = data.optString("netWorth", "₹0")
            val acc1Name = data.optString("acc1Name", "Primary Bank")
            val acc1Bal = data.optString("acc1Bal", "₹0")
            val acc2Name = data.optString("acc2Name", "Savings Account")
            val acc2Bal = data.optString("acc2Bal", "₹0")

            views.setTextViewText(R.id.widget_net_worth_amount, netWorth)
            views.setTextViewText(R.id.widget_acc_name_1, acc1Name)
            views.setTextViewText(R.id.widget_acc_bal_1, acc1Bal)
            views.setTextViewText(R.id.widget_acc_name_2, acc2Name)
            views.setTextViewText(R.id.widget_acc_bal_2, acc2Bal)

            // Deep link for tapping root or Accounts button -> opens Accounts screen
            val openAccountsIntent = Intent(Intent.ACTION_VIEW, Uri.parse("sera://accounts")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val openAccountsPendingIntent = PendingIntent.getActivity(
                context,
                300,
                openAccountsIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_net_worth_root, openAccountsPendingIntent)
            views.setOnClickPendingIntent(R.id.btn_net_worth_action, openAccountsPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        fun updateAll(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val ids = appWidgetManager.getAppWidgetIds(
                ComponentName(context, SeraNetWorthWidgetProvider::class.java)
            )
            for (id in ids) {
                updateWidget(context, appWidgetManager, id)
            }
        }
    }
}
