---
title: Solve sudoku – WIP!
date: 2013-12-13T19:04:59+01:00
modified: 2013-12-13T19:04:59+01:00
slug: solve-sudoku-wip
permalink: /2013/12/13/solve-sudoku-wip/
wpId: 323
description: "[CmdletBinding()] Param() Process{ # Initial process. Clear all grids with hints. $Hash1 = 1 # Set Datahash 1 and 2 to different values. $Hash2 = 0 While($Hash1 -notmatch $Hash2){ $Hash1 = (1..9 | ForEach-Object{($Data | Where-Object{$_.”ID”}).$_}).count Process-Sudoku $Hash2 = (1..9 | ForEach-Object{($Data | Where-Object{$_.”ID”}).$_}).count } } Begin{ # $MyPath = Split-Path $MyInvocation.MyCommand.path -Parent $Data ="
categories: []
tags: []
author: freakling
---

```powershell
[CmdletBinding()]
Param()
Process{
    # Initial process. Clear all grids with hints.

    $Hash1 = 1 # Set Datahash 1 and 2 to different values.
    $Hash2 = 0
    While($Hash1 -notmatch $Hash2){
        $Hash1 = (1..9 | ForEach-Object{($Data | Where-Object{$_."ID"}).$_}).count
        Process-Sudoku
        $Hash2 = (1..9 | ForEach-Object{($Data | Where-Object{$_."ID"}).$_}).count
    }
}
Begin{
    #
    $MyPath = Split-Path $MyInvocation.MyCommand.path -Parent

    $Data = Import-Csv -Path "$MyPath\sudoku.txt" -Delimiter " "

    For($i = 1;$i -le 9;$i++){
        $currentRow = ($Data | Where-Object{$_."ID" -eq $i})
        For($n = 1;$n -le 9;$n++){
            $cell = [int32]($currentRow.$n)
            If($cell -eq 0){
                $currentRow.$n = (1..9)
            }
            Else{
                $currentRow.$n = [array]$cell
            }
        }
    }
    Function Process-Sudoku{

        # Process Horizontal
        For($i = 1;$i -le 9;$i++){
            If($Hash1 -le 162){} ## DEEBUUUGG
            $currentRow = $data[($i-1)]
            $exists = 1..9 | Foreach-Object{If(($currentRow.$_).count -eq 1){$currentRow.$_}}
            $NotSolved = 1..9 | Where-Object{($currentRow.$_).count -gt 1}
            $NotSolved | ForEach-Object{
                [Array]$NewArray = $currentRow.$_ | ForEach-Object{if($exists -match $_){}Else{$_}}
                $currentRow.$_ = $NewArray
            }
        }

        # Process Verical
        For($i = 1;$i -le 9;$i++){
            $CurrentLine = @{}
            For($n = 1;$n -le 9;$n++){
                $currentRow = $Data[($n-1)]
                $CurrentLine += @{$n = $currentRow.$i}
            }
            $Exists = 1..9 | Foreach-Object{If(($CurrentLine.$_).count -eq 1){$currentLine.$_}}
            $NotSolved = 1..9 | Where-Object{($CurrentLine.$_).count -gt 1}
            $NotSolved | ForEach-Object{
                For($n = 1;$n -le 9;$n++){
                    $currentRow = $Data[($_-1)]
                    [Array]$NewArray = $currentRow.$i | ForEach-Object{if($exists -match $_){}Else{$_}}
                    $currentRow.$i = $NewArray
                }
            }
        }
        # Process grid
        For($i = 1;$i -le 9;$i++){

            If($i -le 3){$Mod = 0}
            ElseIf($i -gt 6){$Mod = 6}
            Else{$Mod = 3}

            $CurrentGrid = @{}
            $c = 1
            For($n = 1;$n -le 3;$n++){
                $currentRow = $Data[($n+$mod-1)]
                For($x = 1;$x -le 3;$x++){

                    $CurrentGrid += @{$c = $currentRow.$x}
                    $c++
                }
            }
            $exists = 1..9 | Foreach-Object{If(($CurrentGrid.$_).count -eq 1){$CurrentGrid.$_}}
            $NotSolved = 1..9 | Where-Object{($CurrentGrid.$_).count -gt 1}
            $NotSolved | ForEach-Object{
                If($_ -le 3){$row = 1}
                ElseIf($_ -ge 7){$row = 3}
                Else{$row = 2}
                $currentRow = $Data[($row+$mod-1)]
                [Array]$NewArray = $currentRow.$_ | ForEach-Object{if($exists -match $_){}Else{$_}}
                $currentRow.$_ = $NewArray
            }
        }
    } # End process function
}
End{
    $Data | Format-Table -AutoSize
}
```

Input

```
ID 1 2 3 4 5 6 7 8 9
1 9 0 0 0 0 0 1 2 0
2 0 0 2 3 0 0 0 0 0
3 4 0 0 0 0 5 9 6 0
4 0 8 0 2 0 0 6 0 0
5 0 0 0 0 5 0 0 0 0
6 0 0 1 0 0 9 0 3 0
7 0 7 6 9 0 0 0 0 1
8 0 0 0 0 0 1 7 0 0
9 0 9 8 0 0 0 0 0 4
```
