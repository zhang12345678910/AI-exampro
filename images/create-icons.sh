#!/bin/bash
# 创建简单的 SVG 转 PNG 占位图标

# 使用 ImageMagick 创建简单图标
convert -size 81x81 xc:transparent -fill '#999999' -draw "circle 40,40 40,20" home.png
convert -size 81x81 xc:transparent -fill '#1E88E5' -draw "circle 40,40 40,20" home-active.png

convert -size 81x81 xc:transparent -fill '#999999' -draw "rectangle 25,25 55,55" dictionary.png
convert -size 81x81 xc:transparent -fill '#1E88E5' -draw "rectangle 25,25 55,55" dictionary-active.png

convert -size 81x81 xc:transparent -fill '#999999' -draw "circle 40,30 40,15" -draw "circle 25,50 25,35" -draw "circle 55,50 55,35" profile.png
convert -size 81x81 xc:transparent -fill '#1E88E5' -draw "circle 40,30 40,15" -draw "circle 25,50 25,35" -draw "circle 55,50 55,35" profile-active.png

echo "图标创建完成"
ls -la *.png
