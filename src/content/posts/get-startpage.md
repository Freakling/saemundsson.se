---
title: Get startpage
date: 2013-11-14T17:12:45+01:00
modified: 2017-11-30T08:31:15+01:00
slug: get-startpage
permalink: /2013/11/14/get-startpage/
wpId: 301
description: Invent startpage set in IE for XP and Windows7 clients. Needs a list of computers and collects the startpage in a CSV file. [cmdletbinding()] Param( $Computers, $output, $Progress, [Switch]$Loop ) $ErrorActionPreference = “SilentlyContinue” If(Test-Path -Path $Computers -PathType Leaf){ [Array]$Script:computers = Get-Content $Computers } $ComputerCount = $Computers.Count $Script:Database = @{} Function Get-Startpage{ Param( $output, $Progress )
categories: []
tags: []
author: freakling
---

Invent startpage set in IE for XP and Windows7 clients. Needs a list of computers and collects the startpage in a CSV file.

```powershell
[cmdletbinding()]
Param(
    $Computers,
    $output,
    $Progress,
    [Switch]$Loop
)

$ErrorActionPreference = "SilentlyContinue"

If(Test-Path -Path $Computers -PathType Leaf){
    [Array]$Script:computers = Get-Content $Computers
}

$ComputerCount = $Computers.Count
$Script:Database = @{}
Function Get-Startpage{
    Param(
        $output,
        $Progress
    )
    if(Test-Path -Path $Progress -PathType Leaf){
        [Array]$ProgressContent = Get-Content $Progress
    }
    Else{
        Try{"DATE,Computer,Status" | Out-File $Progress
            [Array]$ProgressContent = Get-Content $Progress
        }
        Catch{Write-Error $_;Break}
    }
    If(!(Test-Path -Path $output -PathType Leaf)){
        Try{'SID,Computername,USER,Start Page' | Out-File $output}
        Catch{Write-Error $_;Break}
    }
    Foreach($Client in $Script:Computers){

        Try{
            [Array]$status = $ProgressContent | Where-Object{ $_ -match "$Client"}
            $Status = $status[-1].Split(",")[-1]
        }
        Catch{$status -eq $null}

        Write-Host $Client

        $Ping = new-object Net.NetworkInformation.Ping

        If(($Ping.Send($Client).Status -eq "Success") -and (($status -eq "Failed") -or ($status -eq $null))){

            $OperatingSystem  = (([adsisearcher]"cn=$client").FindOne()).Properties.operatingsystem

            Switch($OperatingSystem){
                "Windows 7 Enterprise"{
                    Try{$Userprofile = Get-WmiObject -ComputerName $client win32_userprofile}
                    Catch{
                        Write-Host $Client
                        Write-Error $_
        				$Userprofile = $null
        			}
                    If($Userprofile){
                        $Userprofile | Where-Object {($_.localpath -match 'c*users') -and ($_.Loaded)} | Select SID | ForEach-Object{
                            $SID = $_.SID
                            $objSID = New-Object System.Security.Principal.SecurityIdentifier($SID)
                            $objUser = $objSID.Translate([System.Security.Principal.NTAccount])
                            $Username = $objUser.Value.Split("\")[1]
                            $table = @{"USER" = $Username;"SID" = $SID; "Start Page" = "n/a"; "Computername" = "$Client"}
                            $currentUser = New-Object psobject -property $table
                            $Script:Database.$client += @{"$username" = $currentUser}
                        }
                    }
                }

                "Windows XP Professional"{
                    Try{$Userprofile = (Get-WmiObject -computername $Client -Query "Select UserName from Win32_ComputerSystem").UserName}
                    Catch{
                        Write-Host $Client
                        Write-Error $_
        			    $Userprofile = $null
        			}
                    If($Userprofile){
                        $Domain = $Userprofile.Split("\")[0]
                        $Username = $Userprofile.Split("\")[1]
                        $objUser = New-Object System.Security.Principal.NTAccount($Domain, $Username)
                        $SID = ($objUser.Translate([System.Security.Principal.SecurityIdentifier])).Value

                        $table = @{"USER" = $Username;"SID" = $SID; "Start Page" = "n/a"; "Computername" = "$Client"}
                        $currentUser = New-Object psobject -property $table
                        $Script:Database.$client += @{"$username" = $currentUser}
                    }

                }

                "Default"{Break}

            }
            $Userdata = ($Script:Database.$Client | ForEach-Object {$_.Values})
            Foreach($User in $Userdata){
                Try{
                    $SID = $User.SID
                    $objSID = New-Object System.Security.Principal.SecurityIdentifier($SID)
                    $objUser = $objSID.Translate( [System.Security.Principal.NTAccount])  
                    $Username = $objUser.Value.Split("\")[1]
                    $reg = [Microsoft.Win32.RegistryKey]::OpenRemoteBaseKey('USERS', $Client)
                    $regkey = $reg.OpenSubkey("$SID\\Software\\Microsoft\\Internet Explorer\\Main")
                    $StartPage = $regkey.GetValue("Start Page")

                    If($StartPage.GetType().Name -ne "String"){Throw "Value not String"}

                    $Script:Database.$Client.$Username.'Start Page' = $StartPage

                }Catch{
                    Write-Host $Client
                    Write-Error $_
                    $Script:Database.$Client.$Username.'Start Page' = "Unknown"
                }
            }
			Try{
				$Script:Database | ForEach-Object{$_.$Client.Values} | ForEach-Object{
					$SID = $_.SID
					$Computername = $_.Computername
					$User = $_.USER
					$StartPage = $_.'Start Page'
					"$SID,$Computername,$User,$StartPage"
				} | Out-File $output -Append
			}
			Catch{Write-Host $Client;Write-Error $_;Break}

			Try{
				$TimeStamp = Get-Date -Format "yyyyMMdd:HH.mm.ss"
				"$TimeStamp,$Client,Successful" | Out-File $Progress -Append
				$Script:Database.Status += @{"$Client" = $True}
			}
			Catch{Write-Host $Client;Write-Error $_;Break}
        }
        ElseIf(($Status -eq "Successful") -or ($Status -eq "Skipped")){
            #Do nothing. Already Successful.
            $Script:Database.Status += @{"$Client" = $True}
        }
        Else{
            Try{
                $Script:Database.Status += @{"$Client" = $false}
                $TimeStamp = Get-Date -Format "yyyyMMdd:HH.mm.ss"
                "$TimeStamp,$Client,Failed" | Out-File $Progress -Append
            }
            Catch{Write-Host $Client;Write-Error $_}
        }

        $Script:Percentage = 100/$ComputerCount
        $Script:Completed = ($Script:Database.Status.Values | Where-Object{$_ -Match $true}).Count
        If(!$Script:Completed){$Script:Completed = 0}
        $Script:currentpercentage = $Script:Percentage*$Script:Completed

        write-progress -Activity "Collecting Startpage information." -ID 1 -Status "Processing $Client. Completed count: $Script:Completed/$Script:ComputerCount" -PercentComplete $Script:currentpercentage
    }
}

[Void](Get-Startpage -output $Output -Progress $Progress)
If($Loop){
    While(($Database.status.Values  | Where-Object{$_ -Match $false}) -eq $false){
        [Void](Get-Startpage -output $Output -Progress $Progress)
    }
}
```
