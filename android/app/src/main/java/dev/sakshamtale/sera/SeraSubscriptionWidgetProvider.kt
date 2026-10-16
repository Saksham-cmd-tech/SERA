package dev.sakshamtale.sera

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews

class SeraSubscriptionWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.sera_widget_subscription)
            val data = SeraWidgetData.getWidgetData(context)

            val monthlyTotal = data.optString("subMonthlyTotal", "₹0")
            val subCount = data.optString("subCount", "0 Active")
            val nextName = data.optString("subNextName", "No active bills")
            val nextAmt = data.optString("subNextAmt", "")
            val nextDate = data.optString("subNextDate", "No bills due")

            views.setTextViewText(R.id.widget_sub_monthly_total, monthlyTotal)
            views.setTextViewText(R.id.widget_sub_count, subCount)
            views.setTextViewText(R.id.widget_sub_next_name, nextName)
            views.setTextViewText(R.id.widget_sub_next_amt, nextAmt)
            views.setTextViewText(R.id.widget_sub_next_date, nextDate)

            // Deep link -> open Subscriptions
            val subIntent = Intent(Intent.ACTION_VIEW, Uri.parse("sera://subscriptions")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val subPendingIntent = PendingIntent.getActivity(
                context,
                600,
                subIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_subscription_root, subPendingIntent)
            views.setOnClickPendingIntent(R.id.btn_sub_action, subPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        fun updateAll(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val ids = appWidgetManager.getAppWidgetIds(
                ComponentName(context, SeraSubscriptionWidgetProvider::class.java)
            )
            for (id in ids) {
                updateWidget(context, appWidgetManager, id)
            }
        }
    }
}
