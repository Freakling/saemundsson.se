---
title: Custom progress bar
date: 2013-06-25T18:29:12+02:00
modified: 2013-06-26T18:24:40+02:00
slug: custom-progress-bar
permalink: /2013/06/25/custom-progress-bar/
wpId: 264
description: Not that anyone wants or needs it, but here is a custom progress bar! It has two modes. Loop and step. And is called like below. PS> 0..99 | ForEach-Object{“Processing, current step $_”;Start-Sleep -Milliseconds 200;.\epicship.ps1 -step $_};”Installation complete!” .\epicship.ps1 -loop The Loop has more functions, such as a sun shining and getting obscured by the
categories: []
tags: []
author: freakling
---

Not that anyone wants or needs it, but here is a custom progress bar!

[<img src="/wp-content/uploads/2013/06/31-300x86.png" alt="31" width="300" height="86" loading="lazy" decoding="async">](/wp-content/uploads/2013/06/31.png "Step 31")

[<img src="/wp-content/uploads/2013/06/54-300x95.png" alt="54" width="300" height="95" loading="lazy" decoding="async">](/wp-content/uploads/2013/06/54.png "Step 54")

It has two modes. Loop and step. And is called like below.

```powershell
PS> 0..99 | ForEach-Object{"Processing, current step $_";Start-Sleep -Milliseconds 200;.\epicship.ps1 -step $_};"Installation complete!"
```

```
 .\epicship.ps1 -loop
```

The Loop has more functions, such as a sun shining and getting obscured by the ship (notice the reflections dissapearing as the sunrays are blocked by the ship).

[<img src="/wp-content/uploads/2013/06/Loop-300x82.png" alt="Loop" width="300" height="82" loading="lazy" decoding="async">](/wp-content/uploads/2013/06/Loop.png)  
[<img src="/wp-content/uploads/2013/06/Capture-300x71.png" alt="Capture" width="300" height="71" loading="lazy" decoding="async">  
](/wp-content/uploads/2013/06/Capture-1000x238.png)

```powershell
Param(
    [int]$step,
    [Switch]$Loop,
    [string]$FlagMsg,
    [int]$speed = 500,
    $condition = $False
)

$ErrorActionPreference = "SilentlyContinue"

if($step -gt 100){Write-Error "Step cannot exceed 100";Break}
[int]$step = $step/100*77
if($step -le 0){$step++}
#[console]::CursorVisible = $False

Function Animatrix{
    Param(
        [switch]$Loop,
        [int]$step
    )

    if($Loop){$action = "Loop"}
    Elseif($step){$action = "Step"}

    $ship = "                                                                                                                    "
    if(!($FlagMsg)) { $FlagMsg = "LOADING.-" } else {

    $FlagMsg = "$FlagMsg-."

    if($flagmsg.length -gt 22) {
      write-error "Flag text is too long .. max 20 characters!!"
      Break
    }

    }

    # Add padding to left
    while($FlagMsg.length -lt 22) {
      $FlagMsg = " $FlagMsg"
    }

    # Add padding to right
    while($FlagMsg.length -lt 116) {
      $FlagMsg += ' '
    }  
    $ship += $FlagMsg
$ship += @'

                 |
         Ya...___|__..ab.     .   .
          Y88b##\88b##\88b   (     )
           Y88b##:88b##:88b   `.oo'
           :888##|888##|888  ( (`-'
  .-.      d88P##;88P##;88P   `.`.
 //._)    d8P-"""|"""'-Y8P      `.`.
(o(`    .-.  .-. |.-.  .-.  .-.  )oo)
 \o`---(-O-)(-O-)(-O)(-O-)(-O-)-'//
~~`.~~~~`-'~~`-'~~`-'~~`-'~~`-'~~.'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   `----------------------------'
'@

    $arrship = $ship.Split("`n")
    $saveY = [console]::CursorTop
    $saveX = [console]::CursorLeft
    Switch($action){
        "Loop"{

            0..109 | ForEach-Object{
                $i = 0
                $arrship | ForEach-Object{
                    If($i -eq $arrship.count-2){
                        $arrship[$i] = "~" + $arrship[$i].Substring(0,$arrship[$i].Length-1)
                    }
                    else{$arrship[$i] = " " + $arrship[$i].Substring(0,$arrship[$i].Length-1)}
                    $i++
                }
                $n = 0
                $chance = 0
                $sunpos = 60,75
                $sunMultiplier = 0.28
                $arrship | ForEach-Object{
                    $nChar = 0
                    If($n -eq $arrship.Count-5){
                    [char[]]$arrship[$n] | ForEach-Object{
                        If(($nChar -ge $sunpos[0]+5) -and ($nChar -le $sunpos[1]-5)){
                            If($_ -eq " "){Write-Host $_ -BackgroundColor Yellow -NoNewline;$chance += $sunMultiplier}
                            Else{Write-Host $_ -ForegroundColor Yellow -NoNewline}
                        }
                        Elseif($nChar -lt 116){Write-Host $_ -ForegroundColor DarkGray -NoNewline}
                        Else{Write-Host $_ -ForegroundColor DarkGray}
                        $nChar++
                        }
                    }
                    ElseIf($n -eq $arrship.Count-4){
                    [char[]]$arrship[$n] | ForEach-Object{
                        If(($nChar -ge $sunpos[0]+2) -and ($nChar -le $sunpos[1]-2)){
                            If($_ -eq " "){Write-Host $_ -BackgroundColor Yellow -NoNewline;$chance += $sunMultiplier}
                            Else{Write-Host $_ -ForegroundColor Yellow -NoNewline}
                        }
                        Elseif($nChar -lt 116){Write-Host $_ -ForegroundColor DarkGray -NoNewline}
                        Else{Write-Host $_ -ForegroundColor DarkGray}
                        $nChar++
                        }
                    }
                    ElseIf($n -eq $arrship.Count-3){
                    [char[]]$arrship[$n] | ForEach-Object{
                        If(($nChar -ge $sunpos[0]) -and ($nChar -le $sunpos[1]) -and ($_ -eq " ")){Write-Host $_ -BackgroundColor Yellow -NoNewline;$chance += $sunMultiplier}
                        Elseif($nChar -lt 116){Write-Host $_ -ForegroundColor DarkGray -NoNewline}
                        Else{Write-Host $_ -ForegroundColor DarkGray}
                        $nChar++
                        }
                    }
                    ElseIf($n -eq $arrship.count-2){Write-Host $arrship[$n] -ForegroundColor Blue}
                    Elseif($n -eq $arrship.count-1){Write-Host $arrship[$n] -ForegroundColor Cyan}
                    Else{Write-host $arrship[$n] -ForegroundColor DarkGray}
                    $n++
                }

                wavegen -modulus 3 -SunXY $sunpos -chance $chance
                wavegen -modulus 10 -SunXY $sunpos -chance $chance
                wavegen -modulus 30 -SunXY $sunpos -chance $chance
                wavegen -modulus 200 -SunXY $sunpos -chance $chance
                $refchance = $chance*10
                "chance of reflection is: $refchance%"

                Start-Sleep -Milliseconds $speed

                [console]::setcursorposition($saveX,$saveY)
            }
        }
        "Step"{
            Clear-Host
            $i = 0
            $arrship | ForEach-Object{
                If($i -eq $arrship.count-2){$arrship[$i] = "~"*$step + $arrship[$i].Substring(0,$arrship[$i].Length-1*$step)}
                else{$arrship[$i] = " "*$step + $arrship[$i].Substring(0,$arrship[$i].Length-1*$step)}
                    $i++
            }
            $n = 0
            $arrship | ForEach-Object{
                If($n -eq $arrship.count-2){Write-Host $arrship[$n] -ForegroundColor Blue}
                elseif($n -eq $arrship.count-1){Write-Host $arrship[$n] -ForegroundColor Cyan}
                Else{Write-host $arrship[$n] -ForegroundColor Yellow}
                $n++
            }
            $chance = 7
            $sun = 30,45

            wavegen -modulus 3 -SunXY $sun -chance $chance
            wavegen -modulus 10 -SunXY $sun -chance $chance
            wavegen -modulus 30 -SunXY $sun -chance $chance
            wavegen -modulus 200 -SunXY $sun -chance $chance
        }
    }
}

function wavegen{
    Param(
        [int]$modulus,
        [array]$SunXY,
        [int]$chance
    )
    $test = 0
    0..115 | ForEach-Object{
        $test++
        $rand = get-random -Maximum 1000  
        $rand%$modulus
    } | ForEach-Object{

            $i = Get-random -maximum 5  
            If(($test -ge $SunXY[0]) -and ($test -le $SunXY[1]) -and ((Get-Random -Maximum 10) -lt $chance)){
                $color = "Yellow"
            }Else{
                If($i%2 -eq 0){$color = "DarkBlue"}
                else{$color = "blue"}  
            }
            if($_ -eq 1){

                write-host -foregroundcolor $color "~" -NoNewline
            }
            elseif($_ -eq 2){
                Write-Host -ForegroundColor $color "-" -NoNewline
            }
            elseif($_ -eq 3){
                Write-Host -ForegroundColor $color "_" -NoNewline
            }
            else{Write-host " " -NoNewline}  
    }
    Write-host " "
}

If($Loop){
    Animatrix
    While($condition -eq $False){
        Animatrix -Loop
    }
}
Elseif($step){
    Animatrix -step $step
    [console]::setcursorposition($saveX,$saveY)
}
Else{
    Write-Warning "You're doing it wrong!"
}
```
