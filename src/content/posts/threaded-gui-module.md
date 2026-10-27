---
title: Threaded GUI module
date: 2014-11-12T16:30:40+01:00
modified: 2014-11-12T16:30:40+01:00
slug: threaded-gui-module
permalink: /2014/11/12/threaded-gui-module/
wpId: 544
description: Function Invoke-GUI { [cmdletbinding()] Param ( [Parameter(Mandatory=$True,ParameterSetName=”File”)] [String]$File, [Parameter(Mandatory=$True,ParameterSetName=”XAML”)] [XML]$XAML, [Parameter(Mandatory=$False)] [ScriptBlock]$OnTick = {}, [Parameter(Mandatory=$False)] [ScriptBlock]$InitializationScript = {}, [Parameter(Mandatory=$False)] [TimeSpan]$TimerInterval = “0:0:1.00”, [Parameter(Mandatory=$False)] [String]$LogFile ) If($LogFile){ $time = get-date -Format “yyyy-MM-dd HH:mm:ss” “$Time | Starting GUI script” | Out-File $LogFile -Append } $Script:Code = [hashtable]::Synchronized(@{}) $Code.TimerInterval = $TimerInterval $Code.OnTick = $OnTick $Code.InitializationScript = $InitializationScript $Code.ParameterSet
categories: []
tags: []
author: freakling
---

```powershell
Function Invoke-GUI {
<#
    .SYNOPSIS
        Invoke-GUI creates a customizable threaded GUI for powershell
    .DESCRIPTION
        Creates a GUI from XAML file through Windows Presentation Foundation.
        All XAML data that require changeable data requires a "Name" node which sets the variable name
        Any XML nodes with name will get a variable assigned under $Code.<variable> and all subsequent data is accessible from there.
        The main GUI will be assigned $Code.GUI
    .PARAMETER File
        Sets a file with the XAML data used to build the interface.
    .PARAMETER XAML
        Input object in form on an already created XML variable.
    .PARAMETER OnTick
        Code to be executed on each tick
    .PARAMETER InitializationScript
        Code to be performed one time before the GUI shows.
    .PARAMETER TimerInterval
        Timer interval
    .PARAMETER LogFile
        LogFile location
    .Example
        Invoke-GUI -File C:\Application\GUI.xaml
        This loads the GUI without any tick action or custom initialization script.
    .Example
        Invoke-GUI -XAML $XAML -LogFile C:\Application\dump.log
        Loads the GUI from an already compiled XAML object and outputs logs to dump.log
    .Example
        Invoke-GUI -XAML $XAML -OnTick {$Code.MessageBox.Content = "Random number: $(Get-Random)"} -TimerInterval "0:1:0.00" -LogFile C:\Application\dump.log
        As example two but updates a MessageBox variable with a random number once per minute.
    .Example
        Invoke-GUI -XAML $XAML -TimerInterval "0:1:0.00" -LogFile C:\Application\dump.log -OnTick {
            $Code.MessageBox.Content = "Random number: $(Get-Random)"
        } -InitializationScript {
            $Code.Company.Content = "Contoso"
            $Code.Agreement.Value = 0
        }
        As example three but adds some company and agreement information at startup.
#>
[cmdletbinding()]
Param (
    [Parameter(Mandatory=$True,ParameterSetName="File")]
    [String]$File,
    [Parameter(Mandatory=$True,ParameterSetName="XAML")]
    [XML]$XAML,
    [Parameter(Mandatory=$False)]
    [ScriptBlock]$OnTick = {},
    [Parameter(Mandatory=$False)]
    [ScriptBlock]$InitializationScript = {},
    [Parameter(Mandatory=$False)]
    [TimeSpan]$TimerInterval = "0:0:1.00",
    [Parameter(Mandatory=$False)]
    [String]$LogFile
)

    If($LogFile){
        $time = get-date -Format "yyyy-MM-dd HH:mm:ss"
        "$Time | Starting GUI script" | Out-File $LogFile -Append
    }

    $Script:Code = [hashtable]::Synchronized(@{})
    $Code.TimerInterval = $TimerInterval
    $Code.OnTick = $OnTick
    $Code.InitializationScript = $InitializationScript
    $Code.ParameterSet = $PSCmdlet.ParameterSetName
    If($PSCmdlet.ParameterSetName -eq "File"){
        $Code.XAMLFile = $File
    }
    Else{
        $Code.XAML = $XAML
    }

    If($LogFile){
        $Code.LogFile = $LogFile
    }

    $Script:Runspacehash = [hashtable]::Synchronized(@{})
    $Runspacehash.host = $Host
    $Runspacehash.runspace = [RunspaceFactory]::CreateRunspace()
    $Runspacehash.runspace.ApartmentState = “STA”
    $Runspacehash.runspace.ThreadOptions = “ReuseThread”
    $Runspacehash.runspace.Open()
    $Runspacehash.psCmd = {Add-Type -AssemblyName PresentationCore,PresentationFramework,WindowsBase}.GetPowerShell()
    $Runspacehash.runspace.SessionStateProxy.SetVariable("code",$Code)
    $Runspacehash.runspace.SessionStateProxy.SetVariable("Runspacehash",$Runspacehash)
    $Runspacehash.psCmd.Runspace = $Runspacehash.runspace

    $Runspacehash.Handle = $Runspacehash.psCmd.AddScript({

        $Script:Update = {
            # Do stuff on tick here
            .$Code.OnTick
        }

        If($Code.ParameterSet -eq "File"){[XML]$XAML = Get-Content $Code.XAMLFile}
        Else{[XML]$XAML = $Code.XAML}

        # builds gui as $Code.GUI with data from $XAML
        # creates variable for each xml property with the "name" assigned.
        Try {

            [reflection.assembly]::loadwithpartialname("System.Windows.Forms") | Out-Null

            $objXMLReader = (New-Object System.Xml.XmlNodeReader $XAML)
            $Code.GUI = [Windows.Markup.XamlReader]::Load($objXMLReader)

            $Code.GUI.WindowStartupLocation = "CenterScreen"

            If($Code.LogFile){
                $time = get-date -Format "yyyy-MM-dd HH:mm:ss"
                "$Time | Creating variables for XAML elements.." | Out-File $Code.LogFile -Append
            }
            $XAML.SelectNodes("//*[@Name]") | ForEach-Object {
                If($Code.LogFile){
                    $time = get-date -Format "yyyy-MM-dd HH:mm:ss"
                    "$Time | Variable created: `$Code.$($_.Name)" | Out-File $Code.LogFile -Append
                }
                $Code."$($_.Name)" = $Code.GUI.FindName($_.Name)
            }
        }
        Catch {
            If($Code.LogFile){
                $time = get-date -Format "yyyy-MM-dd HH:mm:ss"
                "$Time | $_" | Out-File $Code.LogFile -Append
            }
            Exit
        }

        #Timer Event
        $Code.GUI.Add_SourceInitialized({
            $Script:timer = new-object System.Windows.Threading.DispatcherTimer
            If($Code.LogFile){
                $time = get-date -Format "yyyy-MM-dd HH:mm:ss"
                "$Time | Timer interval is: $($Code.TimerInterval)" | Out-File $Code.LogFile -Append
            }
            $timer.Interval = [TimeSpan]$Code.TimerInterval

            $timer.Add_Tick({
                $Update.Invoke()
                [Windows.Input.InputEventHandler]{$Code.GUI.UpdateLayout()}
            })

            #Start timer
            If($Code.LogFile){
                $time = get-date -Format "yyyy-MM-dd HH:mm:ss"
                "$Time | Starting timer" | Out-File $Code.LogFile -Append
            }
            $timer.Start()
            If (-NOT $timer.IsEnabled) {

                If($Code.LogFile){
                    $time = get-date -Format "yyyy-MM-dd HH:mm:ss"
                    "$Time | Stopping GUI" | Out-File $Code.LogFile -Append
                }

                $Code.GUI.Close()
            }
        })

        $Code.GUI.Add_Closed({
            If($Code.LogFile){
                $time = get-date -Format "yyyy-MM-dd HH:mm:ss"
                "$Time | GUI disposed" | Out-File $Code.LogFile -Append
            }
            $timer.Stop()
            $Runspacehash.PowerShell.Dispose()

            [gc]::Collect()
            [gc]::WaitForPendingFinalizers()
        })

        Try{$Code.InitializationScript.Invoke()}
        Catch{
            If($Code.LogFile){
                $time = get-date -Format "yyyy-MM-dd HH:mm:ss"
                "$Time | $_" | Out-File $Code.LogFile -Append
            }
        }

        # Does not work to place this in the InitializationScript yet. Need to work around this somehow
        $Code.GUI.Add_MouseLeftButtonDown({
            $This.DragMove()
        })

        $Code.GUI.ShowDialog() | Out-Null

    }).BeginInvoke()

    #Give gui time to initialize
    Start-sleep 1
}

Function Update-GUI{
<#
    .SYNOPSIS
        Update-GUI Sends a scriptblock for execution in the GUI thread.
    .DESCRIPTION
        Takes a Scriptblock for execution in the GUI thread.
        It is a simple command (9 rows) but as it is used often converted to a function.
        Code is:
        $Code.GUI.Dispatcher.Invoke([action]{
            Try{.$ScriptBlock}
            Catch{
                If($Code.LogFile){
                    $time = get-date -Format "yyyy-MM-dd HH:mm:ss"
                    "$Time | Could not execute command: $ScriptBlock" | Out-File $Code.LogFile -Append
                }
            }
        })
    .PARAMETER ScriptBlock
        Scriptblock to run inside thread.
    .Example
        Update-GUI -ScriptBlock {$Code.Message.content = "Hello world"}
        Updates the message node content with "hello world"
#>
Param(
    [Parameter(Mandatory=$True)]
    [ScriptBlock]$ScriptBlock
)
    $Code.GUI.Dispatcher.Invoke([action]{
        Try{.$ScriptBlock}
        Catch{
            If($Code.LogFile){
                $time = get-date -Format "yyyy-MM-dd HH:mm:ss"
                "$Time | Could not execute command: $ScriptBlock" | Out-File $Code.LogFile -Append
            }
        }
    })
}
```
