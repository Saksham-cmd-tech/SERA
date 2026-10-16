#!/usr/bin/env python3
"""
Generate high-fidelity, pixel-perfect preview images for SERA Android widgets.
Follows the cyber-technical obsidian dark design system:
- Card Background: #090D14
- Border / Stroke: #182232
- Inset Panel: #0E1520 (Stroke #182333)
- Accents: #EB3B2E (Crimson), #34D399 (Mint)
- Neutrals: #FFFFFF, #E2E8F0, #94A3B8, #64748B
"""

import os
from PIL import Image, ImageDraw, ImageFont

FONT_BOLD = "android/app/src/main/assets/fonts/Inter-Bold.ttf"
FONT_SEMIBOLD = "android/app/src/main/assets/fonts/Inter-SemiBold.ttf"
FONT_REGULAR = "android/app/src/main/assets/fonts/Inter-Regular.ttf"
FONT_MONO = "android/app/src/main/assets/fonts/JetBrainsMono-Bold.ttf"

def font(path, size):
    return ImageFont.truetype(path, size)

def draw_rounded_rect(draw, bbox, fill, outline=None, width=1, radius=20):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def draw_header(draw, left, top, category, live_dot=True, brand="SERA"):
    x = left
    if live_dot:
        dot_r = 5
        draw.ellipse([x, top + 5, x + dot_r * 2, top + 5 + dot_r * 2], fill=(52, 211, 153, 255))
        x += dot_r * 2 + 10
    
    f_brand = font(FONT_BOLD, 17)
    draw.text((x, top), brand, font=f_brand, fill=(148, 163, 184, 255))
    x += int(draw.textlength(brand, font=f_brand)) + 12

    if category:
        f_cat = font(FONT_BOLD, 16)
        draw.text((x, top + 1), category, font=f_cat, fill=(100, 116, 139, 255))

def draw_button(draw, bbox, text, fill, outline, text_color, font_obj, radius=16):
    draw_rounded_rect(draw, bbox, fill=fill, outline=outline, width=2, radius=radius)
    
    if text == "⇄ Move":
        # Draw vector double arrow + text "Move"
        f_txt = font(FONT_BOLD, 22)
        txt_w = draw.textlength("Move", font=f_txt)
        icon_w = 18
        gap = 8
        total_w = icon_w + gap + txt_w
        
        start_x = bbox[0] + (bbox[2] - bbox[0] - total_w) / 2
        cy = bbox[1] + (bbox[3] - bbox[1]) / 2
        
        # Upper arrow pointing right
        y1 = cy - 4
        draw.line([(start_x, y1), (start_x + icon_w, y1)], fill=text_color, width=2)
        draw.line([(start_x + icon_w - 5, y1 - 4), (start_x + icon_w, y1)], fill=text_color, width=2)
        draw.line([(start_x + icon_w - 5, y1 + 4), (start_x + icon_w, y1)], fill=text_color, width=2)
        
        # Lower arrow pointing left
        y2 = cy + 5
        draw.line([(start_x, y2), (start_x + icon_w, y2)], fill=text_color, width=2)
        draw.line([(start_x + 5, y2 - 4), (start_x, y2)], fill=text_color, width=2)
        draw.line([(start_x + 5, y2 + 4), (start_x, y2)], fill=text_color, width=2)
        
        # Text "Move"
        draw.text((start_x + icon_w + gap, cy - 14), "Move", font=f_txt, fill=text_color)
    else:
        bbox_t = draw.textbbox((0, 0), text, font=font_obj)
        tw = bbox_t[2] - bbox_t[0]
        th = bbox_t[3] - bbox_t[1]
        bx = bbox[0] + (bbox[2] - bbox[0] - tw) / 2
        by = bbox[1] + (bbox[3] - bbox[1] - th) / 2 - 2
        draw.text((bx, by), text, font=font_obj, fill=text_color)

# 1. Quick Log (2:1 ratio: 520 x 240)
def render_quick_log():
    W, H = 520, 240
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    
    margin = 8
    card_bbox = [margin, margin, W - margin, H - margin]
    draw_rounded_rect(d, card_bbox, fill=(9, 13, 20, 255), outline=(24, 34, 50, 255), width=2, radius=26)
    
    # Header: Live Dot + SERA on left, ₹1,450 Today on right
    draw_header(d, margin + 22, margin + 20, category=None, live_dot=True)
    
    right_text = "₹1,450 Today"
    f_metric = font(FONT_BOLD, 19)
    rtw = d.textlength(right_text, font=f_metric)
    d.text((W - margin - 22 - rtw, margin + 20), right_text, font=f_metric, fill=(255, 255, 255, 255))
    
    # Bottom Buttons (50/50 split)
    btn_y1 = H - margin - 88
    btn_y2 = H - margin - 22
    btn_w = (W - 2 * margin - 44 - 16) / 2
    f_btn = font(FONT_BOLD, 20)
    
    # + Expense
    btn1_bbox = [margin + 22, btn_y1, margin + 22 + btn_w, btn_y2]
    draw_button(d, btn1_bbox, "+ Expense", fill=(27, 17, 20, 255), outline=(59, 26, 31, 255),
                text_color=(235, 59, 46, 255), font_obj=f_btn, radius=18)
    
    # + Income
    btn2_bbox = [margin + 22 + btn_w + 16, btn_y1, margin + 22 + 2 * btn_w + 16, btn_y2]
    draw_button(d, btn2_bbox, "+ Income", fill=(13, 28, 23, 255), outline=(24, 59, 45, 255),
                text_color=(52, 211, 153, 255), font_obj=f_btn, radius=18)
    
    return im

# 2. Quick Action (4:1 ratio: 1000 x 240)
def render_quick_action():
    W, H = 1000, 240
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    
    margin = 8
    card_bbox = [margin, margin, W - margin, H - margin]
    draw_rounded_rect(d, card_bbox, fill=(9, 13, 20, 255), outline=(24, 34, 50, 255), width=2, radius=28)
    
    # Left side: Live Dot + SERA + TODAY
    draw_header(d, margin + 30, margin + 32, category="TODAY", live_dot=True)
    
    # Big Spend: ₹1,850
    f_spend = font(FONT_BOLD, 52)
    d.text((margin + 30, margin + 74), "₹1,850", font=f_spend, fill=(255, 255, 255, 255))
    
    # Right side 3 action buttons
    btn_y1 = margin + 50
    btn_y2 = H - margin - 50
    btn_w = 175
    gap = 16
    f_btn = font(FONT_BOLD, 22)
    
    # Move
    x_btn3 = W - margin - 30 - btn_w
    btn3_bbox = [x_btn3, btn_y1, x_btn3 + btn_w, btn_y2]
    draw_button(d, btn3_bbox, "⇄ Move", fill=(18, 26, 37, 255), outline=(31, 44, 61, 255),
                text_color=(228, 223, 215, 255), font_obj=f_btn, radius=18)
    
    # + Income
    x_btn2 = x_btn3 - gap - btn_w
    btn2_bbox = [x_btn2, btn_y1, x_btn2 + btn_w, btn_y2]
    draw_button(d, btn2_bbox, "+ Income", fill=(13, 28, 23, 255), outline=(24, 59, 45, 255),
                text_color=(52, 211, 153, 255), font_obj=f_btn, radius=18)
    
    # + Expense
    x_btn1 = x_btn2 - gap - btn_w
    btn1_bbox = [x_btn1, btn_y1, x_btn1 + btn_w, btn_y2]
    draw_button(d, btn1_bbox, "+ Expense", fill=(27, 17, 20, 255), outline=(59, 26, 31, 255),
                text_color=(235, 59, 46, 255), font_obj=f_btn, radius=18)
    
    return im

# 3. Budget (4:2 ratio: 1000 x 480)
def render_budget():
    W, H = 1000, 480
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    
    margin = 8
    card_bbox = [margin, margin, W - margin, H - margin]
    draw_rounded_rect(d, card_bbox, fill=(9, 13, 20, 255), outline=(24, 34, 50, 255), width=2, radius=32)
    
    # Header
    draw_header(d, margin + 36, margin + 34, category="BUDGET", live_dot=True)
    
    # Top-right action: + Log
    btn_w = 120
    btn_bbox = [W - margin - 36 - btn_w, margin + 28, W - margin - 36, margin + 74]
    draw_button(d, btn_bbox, "+ Log", fill=(27, 17, 20, 255), outline=(59, 26, 31, 255),
                text_color=(235, 59, 46, 255), font_obj=font(FONT_BOLD, 20), radius=16)
    
    # Hero Metric: ₹24,800  LEFT OF ₹50,000
    f_rem = font(FONT_BOLD, 68)
    rem_text = "₹24,800"
    d.text((margin + 36, margin + 86), rem_text, font=f_rem, fill=(255, 255, 255, 255))
    
    rw = d.textlength(rem_text, font=f_rem)
    f_sub = font(FONT_BOLD, 22)
    d.text((margin + 36 + rw + 20, margin + 128), "LEFT OF ₹50,000", font=f_sub, fill=(148, 163, 184, 255))
    
    # Inset Cockpit Panel
    panel_y1 = H - margin - 190
    panel_y2 = H - margin - 32
    panel_bbox = [margin + 36, panel_y1, W - margin - 36, panel_y2]
    draw_rounded_rect(d, panel_bbox, fill=(14, 21, 32, 255), outline=(24, 35, 51, 255), width=2, radius=20)
    
    px1 = panel_bbox[0] + 24
    px2 = panel_bbox[2] - 24
    f_lbl = font(FONT_BOLD, 17)
    d.text((px1, panel_y1 + 18), "DAILY ALLOWANCE", font=f_lbl, fill=(100, 116, 139, 255))
    
    f_pace = font(FONT_BOLD, 22)
    pace_text = "₹1,450 / day"
    ptw = d.textlength(pace_text, font=f_pace)
    d.text((px2 - ptw, panel_y1 + 16), pace_text, font=f_pace, fill=(52, 211, 153, 255))
    
    # Progress Bar (50%)
    pb_y = panel_y1 + 60
    pb_h = 14
    # Track
    draw_rounded_rect(d, [px1, pb_y, px2, pb_y + pb_h], fill=(23, 34, 47, 255), radius=7)
    # Fill 50%
    fill_w = (px2 - px1) * 0.50
    draw_rounded_rect(d, [px1, pb_y, px1 + fill_w, pb_y + pb_h], fill=(52, 211, 153, 255), radius=7)
    
    # Line 2 inside panel: MONTHLY PACING ... Spent: ₹25,200
    d.text((px1, panel_y1 + 96), "MONTHLY PACING", font=f_lbl, fill=(100, 116, 139, 255))
    
    f_spent = font(FONT_BOLD, 21)
    sp_text = "Spent: ₹25,200"
    sptw = d.textlength(sp_text, font=f_spent)
    d.text((px2 - sptw, panel_y1 + 94), sp_text, font=f_spent, fill=(235, 59, 46, 255))
    
    return im

# 4. Net Worth / Portfolio (4:2 ratio: 1000 x 480)
def render_net_worth():
    W, H = 1000, 480
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    
    margin = 8
    card_bbox = [margin, margin, W - margin, H - margin]
    draw_rounded_rect(d, card_bbox, fill=(9, 13, 20, 255), outline=(24, 34, 50, 255), width=2, radius=32)
    
    # Header
    draw_header(d, margin + 36, margin + 34, category="PORTFOLIO", live_dot=True)
    
    # Top-right action: Accounts ›
    btn_w = 150
    btn_bbox = [W - margin - 36 - btn_w, margin + 28, W - margin - 36, margin + 74]
    draw_button(d, btn_bbox, "Accounts ›", fill=(18, 26, 37, 255), outline=(31, 44, 61, 255),
                text_color=(228, 223, 215, 255), font_obj=font(FONT_BOLD, 20), radius=16)
    
    # Label: TOTAL NET WORTH
    f_lbl = font(FONT_BOLD, 17)
    d.text((margin + 36, margin + 84), "TOTAL NET WORTH", font=f_lbl, fill=(100, 116, 139, 255))
    
    # Hero Metric: ₹4,82,500
    f_nw = font(FONT_BOLD, 68)
    d.text((margin + 36, margin + 110), "₹4,82,500", font=f_nw, fill=(255, 255, 255, 255))
    
    # Inset Account Container
    panel_y1 = H - margin - 176
    panel_y2 = H - margin - 32
    panel_bbox = [margin + 36, panel_y1, W - margin - 36, panel_y2]
    draw_rounded_rect(d, panel_bbox, fill=(14, 21, 32, 255), outline=(24, 35, 51, 255), width=2, radius=20)
    
    px1 = panel_bbox[0] + 24
    px2 = panel_bbox[2] - 24
    f_row = font(FONT_SEMIBOLD, 22)
    f_amt = font(FONT_BOLD, 22)
    
    # Row 1: HDFC Bank ... ₹3,40,000
    d.text((px1, panel_y1 + 18), "HDFC Bank", font=f_row, fill=(148, 163, 184, 255))
    amt1 = "₹3,40,000"
    d.text((px2 - d.textlength(amt1, font=f_amt), panel_y1 + 18), amt1, font=f_amt, fill=(255, 255, 255, 255))
    
    # Hairline divider
    div_y = panel_y1 + 68
    d.line([(px1, div_y), (px2, div_y)], fill=(22, 34, 50, 255), width=1)
    
    # Row 2: Savings Account ... ₹1,42,500
    d.text((px1, panel_y1 + 84), "Savings Account", font=f_row, fill=(148, 163, 184, 255))
    amt2 = "₹1,42,500"
    d.text((px2 - d.textlength(amt2, font=f_amt), panel_y1 + 84), amt2, font=f_amt, fill=(255, 255, 255, 255))
    
    return im

# 5. Goal (2:2 ratio: 520 x 480)
def render_goal():
    W, H = 520, 480
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    
    margin = 8
    card_bbox = [margin, margin, W - margin, H - margin]
    draw_rounded_rect(d, card_bbox, fill=(9, 13, 20, 255), outline=(24, 34, 50, 255), width=2, radius=30)
    
    # Header: SERA GOAL + Pill badge 68%
    draw_header(d, margin + 26, margin + 28, category="GOAL", live_dot=True)
    
    # Badge 68%
    badge_w = 80
    badge_bbox = [W - margin - 26 - badge_w, margin + 22, W - margin - 26, margin + 60]
    draw_rounded_rect(d, badge_bbox, fill=(18, 26, 38, 255), outline=(30, 44, 62, 255), width=1, radius=12)
    f_badge = font(FONT_BOLD, 19)
    pct = "68%"
    ptw = d.textlength(pct, font=f_badge)
    d.text((badge_bbox[0] + (badge_w - ptw) / 2, badge_bbox[1] + 7), pct, font=f_badge, fill=(52, 211, 153, 255))
    
    # Goal Title: Emergency Fund
    f_title = font(FONT_BOLD, 36)
    d.text((margin + 26, margin + 115), "Emergency Fund", font=f_title, fill=(255, 255, 255, 255))
    
    # Inset Card
    panel_y1 = margin + 200
    panel_y2 = margin + 390
    panel_bbox = [margin + 26, panel_y1, W - margin - 26, panel_y2]
    draw_rounded_rect(d, panel_bbox, fill=(14, 21, 32, 255), outline=(24, 35, 51, 255), width=2, radius=20)
    
    px1 = panel_bbox[0] + 20
    px2 = panel_bbox[2] - 20
    f_lbl = font(FONT_BOLD, 15)
    d.text((px1, panel_y1 + 22), "SAVED PROGRESS", font=f_lbl, fill=(100, 116, 139, 255))
    
    # Progress text: ₹68,000 of ₹1,00,000
    f_prog_txt = font(FONT_BOLD, 24)
    pt = "₹68,000 of ₹1,00,000"
    d.text((px1, panel_y1 + 54), pt, font=f_prog_txt, fill=(255, 255, 255, 255))
    
    # Progress Bar (68%)
    pb_y = panel_y1 + 115
    pb_h = 16
    draw_rounded_rect(d, [px1, pb_y, px2, pb_y + pb_h], fill=(23, 34, 47, 255), radius=8)
    fill_w = (px2 - px1) * 0.68
    draw_rounded_rect(d, [px1, pb_y, px1 + fill_w, pb_y + pb_h], fill=(52, 211, 153, 255), radius=8)
    
    return im

# 6. Dashboard (4:3 ratio: 1000 x 720)
def render_dashboard():
    W, H = 1000, 720
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    
    margin = 8
    card_bbox = [margin, margin, W - margin, H - margin]
    draw_rounded_rect(d, card_bbox, fill=(9, 13, 20, 255), outline=(24, 34, 50, 255), width=2, radius=34)
    
    # Top Header: Live dot + SERA NET WORTH
    draw_header(d, margin + 36, margin + 32, category="NET WORTH", live_dot=True)
    
    # Top-right This Month Spend Pill
    pill_w = 210
    pill_bbox = [W - margin - 36 - pill_w, margin + 26, W - margin - 36, margin + 110]
    draw_rounded_rect(d, pill_bbox, fill=(18, 26, 38, 255), outline=(30, 44, 62, 255), width=1, radius=18)
    f_plbl = font(FONT_BOLD, 15)
    d.text((pill_bbox[0] + 20, pill_bbox[1] + 16), "THIS MONTH", font=f_plbl, fill=(100, 116, 139, 255))
    f_pamt = font(FONT_BOLD, 30)
    d.text((pill_bbox[0] + 20, pill_bbox[1] + 42), "₹24,500", font=f_pamt, fill=(235, 59, 46, 255))
    
    # Hero Net Worth: ₹4,82,500
    f_nw = font(FONT_BOLD, 58)
    d.text((margin + 36, margin + 64), "₹4,82,500", font=f_nw, fill=(255, 255, 255, 255))
    
    # Divider
    div_y = margin + 142
    d.line([(margin + 36, div_y), (W - margin - 36, div_y)], fill=(22, 34, 50, 255), width=2)
    
    # Inset Activity Container
    act_y1 = margin + 164
    act_y2 = margin + 460
    act_bbox = [margin + 36, act_y1, W - margin - 36, act_y2]
    draw_rounded_rect(d, act_bbox, fill=(14, 21, 32, 255), outline=(24, 35, 51, 255), width=2, radius=22)
    
    px1 = act_bbox[0] + 26
    px2 = act_bbox[2] - 26
    
    # Activity Title
    f_albl = font(FONT_BOLD, 17)
    d.text((px1, act_y1 + 22), "RECENT ACTIVITY", font=f_albl, fill=(100, 116, 139, 255))
    
    f_tx_name = font(FONT_SEMIBOLD, 24)
    f_tx_amt = font(FONT_BOLD, 24)
    
    # Row 1: Apple Store ... -₹12,900
    r1_y = act_y1 + 72
    d.text((px1, r1_y), "Apple Store", font=f_tx_name, fill=(226, 232, 240, 255))
    a1 = "-₹12,900"
    d.text((px2 - d.textlength(a1, font=f_tx_amt), r1_y), a1, font=f_tx_amt, fill=(235, 59, 46, 255))
    
    # Row divider
    rdiv_y = act_y1 + 138
    d.line([(px1, rdiv_y), (px2, rdiv_y)], fill=(22, 34, 50, 255), width=1)
    
    # Row 2: Client Retainer ... +₹45,000
    r2_y = act_y1 + 166
    d.text((px1, r2_y), "Client Retainer", font=f_tx_name, fill=(226, 232, 240, 255))
    a2 = "+₹45,000"
    d.text((px2 - d.textlength(a2, font=f_tx_amt), r2_y), a2, font=f_tx_amt, fill=(52, 211, 153, 255))
    
    # Bottom 3 Action Buttons
    btn_y1 = H - margin - 120
    btn_y2 = H - margin - 36
    btn_w = (W - 2 * margin - 72 - 32) / 3
    f_btn = font(FONT_BOLD, 22)
    
    # 1: Expense
    b1_bbox = [margin + 36, btn_y1, margin + 36 + btn_w, btn_y2]
    draw_button(d, b1_bbox, "+ Expense", fill=(27, 17, 20, 255), outline=(59, 26, 31, 255),
                text_color=(235, 59, 46, 255), font_obj=f_btn, radius=18)
    
    # 2: Income
    b2_x = margin + 36 + btn_w + 16
    b2_bbox = [b2_x, btn_y1, b2_x + btn_w, btn_y2]
    draw_button(d, b2_bbox, "+ Income", fill=(13, 28, 23, 255), outline=(24, 59, 45, 255),
                text_color=(52, 211, 153, 255), font_obj=f_btn, radius=18)
    
    # 3: Move
    b3_x = b2_x + btn_w + 16
    b3_bbox = [b3_x, btn_y1, b3_x + btn_w, btn_y2]
    draw_button(d, b3_bbox, "⇄ Move", fill=(18, 26, 37, 255), outline=(31, 44, 61, 255),
                text_color=(228, 223, 215, 255), font_obj=f_btn, radius=18)
    
    return im

# 7. Subscription / Bills (4:2 ratio: 1000 x 480)
def render_subscription():
    W, H = 1000, 480
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    
    margin = 8
    card_bbox = [margin, margin, W - margin, H - margin]
    draw_rounded_rect(d, card_bbox, fill=(9, 13, 20, 255), outline=(24, 34, 50, 255), width=2, radius=32)
    
    # Header: SERA BILLS + Manage › button
    draw_header(d, margin + 36, margin + 34, category="BILLS", live_dot=True)
    
    btn_w = 140
    btn_bbox = [W - margin - 36 - btn_w, margin + 28, W - margin - 36, margin + 74]
    draw_button(d, btn_bbox, "Manage ›", fill=(18, 26, 37, 255), outline=(31, 44, 61, 255),
                text_color=(228, 223, 215, 255), font_obj=font(FONT_BOLD, 20), radius=16)
    
    # Label: MONTHLY COMMITMENT
    f_lbl = font(FONT_BOLD, 17)
    d.text((margin + 36, margin + 84), "MONTHLY COMMITMENT", font=f_lbl, fill=(100, 116, 139, 255))
    
    # Hero Metric: ₹4,290   5 Active
    f_amt = font(FONT_BOLD, 68)
    amt_text = "₹4,290"
    d.text((margin + 36, margin + 110), amt_text, font=f_amt, fill=(255, 255, 255, 255))
    
    aw = d.textlength(amt_text, font=f_amt)
    f_cnt = font(FONT_BOLD, 24)
    d.text((margin + 36 + aw + 20, margin + 152), "5 Active", font=f_cnt, fill=(148, 163, 184, 255))
    
    # Inset Next Due Bill Card
    panel_y1 = H - margin - 180
    panel_y2 = H - margin - 32
    panel_bbox = [margin + 36, panel_y1, W - margin - 36, panel_y2]
    draw_rounded_rect(d, panel_bbox, fill=(14, 21, 32, 255), outline=(24, 35, 51, 255), width=2, radius=20)
    
    px1 = panel_bbox[0] + 24
    px2 = panel_bbox[2] - 24
    
    # Label: NEXT UPCOMING BILL
    d.text((px1, panel_y1 + 18), "NEXT UPCOMING BILL", font=f_lbl, fill=(100, 116, 139, 255))
    
    # Row: Netflix 4K ... ₹649
    f_name = font(FONT_BOLD, 26)
    f_due_amt = font(FONT_BOLD, 26)
    d.text((px1, panel_y1 + 52), "Netflix 4K", font=f_name, fill=(255, 255, 255, 255))
    d_amt = "₹649"
    d.text((px2 - d.textlength(d_amt, font=f_due_amt), panel_y1 + 52), d_amt, font=f_due_amt, fill=(235, 59, 46, 255))
    
    # Date: Due Oct 24
    f_date = font(FONT_SEMIBOLD, 20)
    d.text((px1, panel_y1 + 94), "Due Oct 24", font=f_date, fill=(148, 163, 184, 255))
    
    return im

def main():
    generators = {
        "widget_preview_quick_log.png": render_quick_log,
        "widget_preview_quick_action.png": render_quick_action,
        "widget_preview_budget.png": render_budget,
        "widget_preview_net_worth.png": render_net_worth,
        "widget_preview_goal.png": render_goal,
        "widget_preview_dashboard.png": render_dashboard,
        "widget_preview_subscription.png": render_subscription,
    }
    
    target_dirs = [
        "android/app/src/main/res/drawable",
        "android/app/src/main/res/drawable-nodpi",
    ]
    
    for filename, gen_fn in generators.items():
        print(f"Generating {filename}...")
        img = gen_fn()
        for d in target_dirs:
            out_path = os.path.join(d, filename)
            img.save(out_path, format="PNG")
            print(f"  -> Saved {out_path} ({img.size[0]}x{img.size[1]})")

if __name__ == "__main__":
    main()
