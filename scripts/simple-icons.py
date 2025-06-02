#!/usr/bin/env python3
"""
简化版图标生成器
仅使用基础的PIL功能创建深色系图标
"""

try:
    from PIL import Image, ImageDraw
    import os
    
    def create_simple_icon(size):
        """创建简化版深色图标"""
        # 创建透明背景
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # 计算相对尺寸
        center = size // 2
        radius = int(size * 0.45)
        
        # 深色圆形背景
        draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                    fill=(45, 55, 72, 255), outline=(74, 85, 104, 255), width=max(1, size//40))
        
        # 搜索放大镜
        search_x = center - size//6
        search_y = center - size//6  
        search_r = size//8
        
        # 放大镜圆圈
        draw.ellipse([search_x-search_r, search_y-search_r, search_x+search_r, search_y+search_r],
                    outline=(102, 126, 234, 255), width=max(2, size//20))
        
        # 放大镜柄
        handle_x = search_x + search_r//2
        handle_y = search_y + search_r//2
        draw.line([handle_x, handle_y, handle_x+size//10, handle_y+size//10],
                 fill=(102, 126, 234, 255), width=max(2, size//20))
        
        # 简化的星形（使用三角形拼接）
        star_x = center + size//4
        star_y = center - size//4
        star_size = size//12
        
        # 上三角
        draw.polygon([(star_x, star_y-star_size), 
                     (star_x-star_size//2, star_y), 
                     (star_x+star_size//2, star_y)], 
                    fill=(240, 147, 251, 220))
        
        # 下三角  
        draw.polygon([(star_x, star_y+star_size), 
                     (star_x-star_size//2, star_y), 
                     (star_x+star_size//2, star_y)], 
                    fill=(240, 147, 251, 220))
        
        # 时钟圆圈
        clock_x = center + size//4
        clock_y = center + size//5
        clock_r = size//15
        
        draw.ellipse([clock_x-clock_r, clock_y-clock_r, clock_x+clock_r, clock_y+clock_r],
                    outline=(79, 172, 254, 255), width=max(1, size//30))
        
        # 时钟指针
        draw.line([clock_x, clock_y, clock_x, clock_y-clock_r//2],
                 fill=(79, 172, 254, 255), width=max(1, size//30))
        draw.line([clock_x, clock_y, clock_x+clock_r//2, clock_y],
                 fill=(79, 172, 254, 255), width=max(1, size//30))
        
        return img
    
    def main():
        """生成图标文件"""
        sizes = [16, 32, 48, 128]
        
        # 确保目录存在
        os.makedirs('public/icon', exist_ok=True)
        
        for size in sizes:
            print(f"生成 {size}x{size} 图标...")
            icon = create_simple_icon(size)
            icon.save(f'public/icon/{size}.png', 'PNG')
            print(f"已保存: public/icon/{size}.png")
        
        print("✅ 所有图标生成完成!")
    
    if __name__ == '__main__':
        main()
        
except ImportError:
    print("❌ 错误: 请先安装 Pillow 库")
    print("💡 运行命令: pip install Pillow")
except Exception as e:
    print(f"❌ 生成图标时出错: {e}")
    print("💡 请检查 Pillow 库是否正确安装") 