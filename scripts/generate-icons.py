#!/usr/bin/env python3
"""
生成不同尺寸的PNG图标文件
需要安装: pip install Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os

def create_icon(size):
    """创建指定尺寸的深色系浏览器搜索扩展图标"""
    
    # 创建画布
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 计算相对尺寸
    center = size // 2
    radius = int(size * 0.47)
    
    # 背景圆形 - 深色渐变效果
    for i in range(radius):
        alpha = int(255 * (1 - i / radius * 0.3))
        color = (45 + i//4, 55 + i//4, 72 + i//4, alpha)
        draw.ellipse([center-radius+i, center-radius+i, center+radius-i, center+radius-i], 
                    fill=color, outline=None)
    
    # 主边框
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                outline=(74, 85, 104, 255), width=max(1, size//50))
    
    # 搜索放大镜
    search_center_x = center - size//8
    search_center_y = center - size//8
    search_radius = size//6
    
    # 放大镜圆圈
    draw.ellipse([search_center_x-search_radius, search_center_y-search_radius,
                 search_center_x+search_radius, search_center_y+search_radius],
                outline=(102, 126, 234, 255), width=max(2, size//25))
    
    # 放大镜柄
    handle_start_x = search_center_x + int(search_radius * 0.7)
    handle_start_y = search_center_y + int(search_radius * 0.7)
    handle_end_x = handle_start_x + size//8
    handle_end_y = handle_start_y + size//8
    
    # 绘制粗线条（通过多次绘制细线实现）
    line_width = max(2, size//25)
    for i in range(line_width):
        for j in range(line_width):
            draw.line([handle_start_x+i, handle_start_y+j, handle_end_x+i, handle_end_y+j],
                     fill=(102, 126, 234, 255), width=1)
    
    # 收藏夹星形
    star_x = center + size//4
    star_y = center - size//3
    star_size = size//10
    
    # 简化的星形（用多边形）
    star_points = []
    for i in range(10):
        angle = i * math.pi / 5
        if i % 2 == 0:
            r = star_size
        else:
            r = star_size * 0.5
        x = star_x + r * math.cos(angle - math.pi/2)
        y = star_y + r * math.sin(angle - math.pi/2)
        star_points.append((int(x), int(y)))
    
    draw.polygon(star_points, fill=(240, 147, 251, 230))
    
    # 历史记录时钟
    clock_x = center + size//3
    clock_y = center + size//4
    clock_radius = size//12
    
    # 时钟圆圈
    draw.ellipse([clock_x-clock_radius, clock_y-clock_radius,
                 clock_x+clock_radius, clock_y+clock_radius],
                outline=(79, 172, 254, 255), width=max(1, size//40))
    
    # 时钟指针
    draw.line([clock_x, clock_y, clock_x, clock_y-clock_radius//2],
             fill=(79, 172, 254, 255), width=max(1, size//50))
    draw.line([clock_x, clock_y, clock_x+clock_radius//2, clock_y],
             fill=(79, 172, 254, 255), width=max(1, size//50))
    
    # 搜索结果列表线条
    list_x = center - size//4
    list_y = center + size//6
    list_spacing = size//20
    
    for i in range(4):
        y = list_y + i * list_spacing
        width = [size//6, size//4, size//8, size//5][i]
        draw.rectangle([list_x, y, list_x + width, y + max(1, size//60)],
                      fill=(226, 232, 240, 150))
    
    # 添加微妙的光效
    highlight_points = [
        (center - size//6, center - size//4),
        (center + size//5, center - size//6),
        (center - size//8, center + size//3)
    ]
    
    for x, y in highlight_points:
        dot_size = max(1, size//80)
        draw.ellipse([x-dot_size, y-dot_size, x+dot_size, y+dot_size],
                    fill=(247, 250, 252, 200))
    
    return img

def main():
    """生成所有尺寸的图标"""
    sizes = [16, 32, 48, 128]
    
    # 确保输出目录存在
    os.makedirs('public/icon', exist_ok=True)
    
    for size in sizes:
        print(f"生成 {size}x{size} 图标...")
        icon = create_icon(size)
        icon.save(f'public/icon/{size}.png', 'PNG')
    
    print("图标生成完成！")

if __name__ == '__main__':
    main() 