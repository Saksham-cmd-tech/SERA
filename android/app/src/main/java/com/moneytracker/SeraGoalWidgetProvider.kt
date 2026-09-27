package com.moneytracker

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews

class SeraGoalWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.sera_widget_goal)
            val data = SeraWidgetData.getWidgetData(context)

            val title = data.optString("goalTitle", "Emergency Fund")
            val amounts = data.optString("goalAmounts", "₹0 of ₹0")
            val percent = data.optInt("goalPercent", 0)

            views.setTextViewText(R.id.widget_goal_title, title)
            views.setTextViewText(R.id.widget_goal_amounts, amounts)
            views.setProgressBar(R.id.widget_goal_progress, 100, percent, false)
            views.setTextViewText(R.id.widget_goal_percent, "$percent% completed")

            // Tap root -> open Goals
            val openGoalsIntent = Intent(Intent.ACTION_VIEW, Uri.parse("sera://goals")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val openGoalsPendingIntent = PendingIntent.getActivity(
                context,
                400,
                openGoalsIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_goal_root, openGoalsPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        fun updateAll(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val ids = appWidgetManager.getAppWidgetIds(
                ComponentName(context, SeraGoalWidgetProvider::class.java)
            )
            for (id in ids) {
                updateWidget(context, appWidgetManager, id)
            }
        }
    }
}
