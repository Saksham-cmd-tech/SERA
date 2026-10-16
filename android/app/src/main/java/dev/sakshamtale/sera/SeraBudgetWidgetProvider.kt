package dev.sakshamtale.sera

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews

class SeraBudgetWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.sera_widget_budget)
            val data = SeraWidgetData.getWidgetData(context)

            val remaining = data.optString("budgetRemaining", "₹0")
            val total = data.optString("budgetTotal", "LEFT OF ₹0")
            val progress = data.optInt("budgetProgress", 0)
            val dailyPace = data.optString("dailySafeSpend", "Safe spend: ₹0 / day")
            val spentTotal = data.optString("monthSpent", "Spent: ₹0")

            views.setTextViewText(R.id.widget_budget_remaining, remaining)
            views.setTextViewText(R.id.widget_budget_total, total)
            views.setProgressBar(R.id.widget_budget_progress, 100, progress, false)
            views.setTextViewText(R.id.widget_budget_daily_pace, dailyPace)
            views.setTextViewText(R.id.widget_budget_spent_total, spentTotal)

            // Tap root -> open Budgets screen
            val openBudgetsIntent = Intent(Intent.ACTION_VIEW, Uri.parse("sera://budgets")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val openBudgetsPendingIntent = PendingIntent.getActivity(
                context,
                200,
                openBudgetsIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_budget_root, openBudgetsPendingIntent)

            // + Expense
            val expenseIntent = Intent(Intent.ACTION_VIEW, Uri.parse("sera://add-expense")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val expensePendingIntent = PendingIntent.getActivity(
                context,
                201,
                expenseIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_budget_add_expense, expensePendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        fun updateAll(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val ids = appWidgetManager.getAppWidgetIds(
                ComponentName(context, SeraBudgetWidgetProvider::class.java)
            )
            for (id in ids) {
                updateWidget(context, appWidgetManager, id)
            }
        }
    }
}
