---
title: Powershell & Graphs
date: 2017-10-30T16:04:58+01:00
modified: 2017-10-30T16:04:58+01:00
slug: powershell-graphs
permalink: /2017/10/30/powershell-graphs/
wpId: 691
description: "TL;DR I wanted to draw graphs in powershell without any external dependancies. So I did, results below. How to graph: Create one or more array of points Join arrays into another array of lines Execute Draw-Graph function with some data #Build graph [Array]$Line1 = 1..12 | ForEach-Object{Get-Random (10..20)} $p=Get-Random (14..25) $p%5 [Array]$Line2 = 1..12 |"
categories: []
tags: []
author: freakling
---

TL;DR I wanted to draw graphs in powershell without any external dependancies. So I did, results below.

[<img src="/wp-content/uploads/2017/10/9be02ad2-e24d-4688-8abb-a488a7ffafbf-300x150.png" alt="" width="300" height="150" loading="lazy" decoding="async">](/wp-content/uploads/2017/10/9be02ad2-e24d-4688-8abb-a488a7ffafbf.png)

How to graph:  
Create one or more array of points  
Join arrays into another array of lines  
Execute Draw-Graph function with some data

```powershell
#Build graph
[Array]$Line1 = 1..12 | ForEach-Object{Get-Random (10..20)}
$p=Get-Random (14..25)
$p%5
[Array]$Line2 = 1..12 | ForEach-Object{
    If($p%5 -eq 0){
        $p-=(get-random (1..3))
    }
    Else{
        $p+=(get-random (1..5))
    }
    $p
}
[Array]$Lines = $Line1,$Line2
$Legend = "Line1 Header","Line2 Header"
$Colors = "Blue","Green"

$file = ([guid]::NewGuid()).Guid
$file = "$env:TEMP\$file.png"
Draw-Graph -Lines $Lines -Legend $Legend -Colors $Colors -Header "Header" -SaveDestination $file
.$file
```

Graph functions/Initialization

```powershell
Add-Type -AssemblyName System.Windows.Forms,System.Drawing

Function Get-Color{
    $rbg = @()

    For($i = 0;$i -le 3;$i++){
        Switch($i){
            #Black
            0{ $rbg += 255}#Get-Random -Minimum 128 -Maximum 255 }
            #RGB
            Default{$rbg += Get-Random -Minimum 0 -Maximum 255}
        }
    }
    Return $rbg
}

Function Draw-Graph{
Param(
    $Width = 1024,
    $Height = 512,
    [Array]$Lines,
    [Array]$Legend,
    [Array]$Colors,
    $Header = "Graph",
    $SaveDestination,
    [Switch]$Preview
)
    Begin{}
    Process{
    If($Preview){
        [Windows.Forms.Form]$Window = New-Object System.Windows.Forms.Form

        $Window.Width = $Width
        $Window.Height = $Height

        $Window.Show()
        $Window.Refresh()

        [Drawing.Graphics]$Graph = $Window.CreateGraphics()
    }
    Else{
        $bmp = New-Object Drawing.Bitmap $Width,$Height
        $Graph = [Drawing.Graphics]::FromImage($bmp)

    }
    $Graph.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $Graph.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $Graph.TextRenderingHint = [Drawing.Text.TextRenderingHint]::AntiAlias
    $Graph.CompositingQuality = [Drawing.Drawing2D.CompositingQuality]::HighQuality

    $Background = [System.Drawing.Color]::Snow
    $Graph.Clear($Background)

    $TextBrush = New-Object Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 212,252))
    $Font = New-object System.Drawing.Font("arial",12)  
    $gridPen = [Drawing.Pens]::LightGray

    #Draw Graph area
    $DrawArea = New-Object 'object[,]' 2,2

    # X (Width)
    [int]$DrawArea[0,0] = $Width/10
    [int]$DrawArea[0,1] = ($Width-$Width/6)
    # Y (Height)
    [int]$DrawArea[1,0] = $Height/10
    [int]$DrawArea[1,1] = ($Height-$Height/3)

    # Get X bounds
    $xFac = ($Lines | ForEach-Object{$_.Length} | Sort -Descending)[0]-1
    $xInc = ($DrawArea[0,1]-$DrawArea[0,0]+$DrawArea[0,0])/$xFac

    #Get Y bounds
    $yMax = ($lines | ForEach-Object{$_} | sort -Descending)[0]
    $yFac = ($DrawArea[1,1]-$DrawArea[1,0])/$yMax

    #Draw box
    $Graph.DrawRectangle($gridPen, ($DrawArea[0,0]),($DrawArea[1,0]),($DrawArea[0,1]),($DrawArea[1,1]))

    #Draw Header
    $Textpoint = New-Object System.Drawing.PointF ((($DrawArea[0,1]-$DrawArea[0,0])/2+$DrawArea[0,0]),($DrawArea[1,0]/2))
    $Graph.DrawString($Header,$Font,$TextBrush,$TextPoint)

    #Draw horizontal lines
    $scaleFac = 0.1
    $i = 1
    #Get scale
    While($i -ge 1){
        $scaleFac = $scaleFac*10
        $i = $yMax/$scaleFac
    }
    $scaleFac = $scaleFac/10

    0..($yMax/$scaleFac) | ForEach-Object{
        $y = $DrawArea[1,1]-(($_*$scaleFac)*$yFac)+$DrawArea[1,0]
        $x1 = $DrawArea[0,0]
        $x2 = $DrawArea[0,1]+$DrawArea[0,0]

        $Graph.DrawLine($gridPen,$x1,$y,$x2,$y)
        $thisPoint = New-Object System.Drawing.PointF (($x1-10),($y-15))
        $thisSF = New-object System.Drawing.StringFormat
        $thisSF.Alignment = "Far"
        $Graph.DrawString("$($_*$scaleFac)",$Font,$TextBrush,$thisPoint,$thisSF)
    }

    If($lines[0].Count -le 1){
        $tmp = $Lines
        Remove-Variable Lines
        $Lines = @(0)
        $Lines[0] = $tmp
        Remove-Variable tmp
        $Lines
    }

    #DRAW LINE
    $l = 0
    Foreach($Line in $Lines){
        If($Colors.Count -gt $l){
            $Pen = New-Object Drawing.Pen($Colors[$l])
        }
        Else{
            $rgb = Get-Color
            $Pen = New-object Drawing.Pen([System.Drawing.Color]::FromArgb($rgb[0],$rgb[1],$rgb[2],$rgb[3]))
        }
        $Pen.Width = 2

        #Initiate/Reset Points
        $Points = @()
        $Step = 0

        Foreach($point in $line){

            $x = ($xInc*$step)+$DrawArea[0,0]
            $y = $DrawArea[1,1]-($point*$yFac)+$DrawArea[1,0]

            $Points += New-Object System.Drawing.PointF($x,$y)
            $Step++
        }
        $Graph.DrawLines($pen,$Points)

        If($Legend.Count -gt $l){
            $thisLegend = $Legend[$l]
            If($Colors.Count -gt $l){
                $thisBrush = New-Object Drawing.SolidBrush($Colors[$l])
            }
            Else{
                $rgb = Get-Color
                $thisBrush = New-Object Drawing.SolidBrush([System.Drawing.Color]::FromArgb($rgb[0],$rgb[1],$rgb[2],$rgb[3]))
            }

            $y = $DrawArea[1,1]+$DrawArea[1,0]+20
            $x = $DrawArea[0,0]+100*$l

            $thisPoint = New-Object System.Drawing.PointF ($x,$y)
            $thisFont = New-Object System.Drawing.Font("arial",12,[System.Drawing.FontStyle]::Bold)
            $Graph.DrawString($thisLegend,$thisFont,$thisBrush,$thisPoint)
        }
        $l++
    }

    }
    End{

        If($Preview){
            Start-Sleep 10
        }
        Else{
            $bmp.save($SaveDestination)
        }

        Try{$Graph.Dispose()}Catch{}
        Try{$bmp.Dispose()}Catch{}
        Try{$Window.Close()}Catch{}
        Try{$Window.Dispose()}Catch{}
    }
}
```
