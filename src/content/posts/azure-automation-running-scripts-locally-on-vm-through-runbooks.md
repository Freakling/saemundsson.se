---
title: Azure Automation – Running scripts locally on VM through runbooks
date: 2017-12-11T10:46:48+01:00
modified: 2017-12-11T10:53:23+01:00
slug: azure-automation-running-scripts-locally-on-vm-through-runbooks
permalink: /2017/12/11/azure-automation-running-scripts-locally-on-vm-through-runbooks/
wpId: 726
description: "Reblogged from my company blog: https://tech.xenit.se/azure-automation-running-scripts-locally-vm-runbooks/ — I was tasked to create a powershell script to run on a schedule on a Azure VM. Normally this would be running as a scheduled task on the VM but seeing as we’re working with AzureVM and schedule tasks are legacy I wanted to explore the possibilities of"
categories: []
tags: []
author: freakling
---

Reblogged from my company blog: [https://tech.xenit.se/azure-automation-running-scripts-locally-vm-runbooks/](https://tech.xenit.se/azure-automation-running-scripts-locally-vm-runbooks/)  
—  
I was tasked to create a powershell script to run on a schedule on a Azure VM. Normally this would be running as a scheduled task on the VM but seeing as we’re working with AzureVM and schedule tasks are legacy I wanted to explore the possibilities of running the schedule and script in Azure to keep the VM clean and the configuration scalable.

After some research the best option would be running the powershell script as a CustomScriptExtension on the VM, and the schedule would be handled by a Process Automation Runbook (using Automation Accounts).

What I ended up with is the script below. It’s fairly easy to configure and contains almost all the required configuration in the parameters.

How does it work? Simple!

### Prerequisites

1.  Create a Storage Account
    -   Create a Private Blob container
2.  Create a Automation Account
    -   Make sure a RunAsAccount is created

### Runbook configuration

1.  Navigate to the Automation Account you intend to use
2.  Create a Powershell runbook and press Edit
3.  Copy the below script into the runbook and save
    -   Fill out the parameters with relevant information (subscription, resourcegroup etc)
    -   Make sure to set the name of the StorageContainer to the one where you want to host the scripts
    -   Extension name should be unique for the job, as well as the ScriptName
    -   The scriptblock parameter takes the script you intend to run on the VMs
4.  On the first run, go into the Test Pane from edit view and edit the UploadScript parameter to $True
    -   This will make the runbook actually save the script to the Container, allowing the VM download and run the script
5.  Done!

Now simply register schedules to the runbook. If you want to run the script on several VM you have two options. Either specify multiple VM when creating schedules or create a schedule per machine you want to run the script against.

```powershell
[cmdletbinding()]
Param(
    $SubscriptionID = '<SubscriptionID>',
    $ResourceGroup = 'RG-NorthEU',
    $VMNames = @('vmname1','vmname2'),
    $StorageAccount = '<StorageAccount>',
    $StorageAccountKey = '<Storagekey>',
    $StorageContainer = 'sc-scripts', # Create this manually before first execution!
    $ExtensionName = 'Xenit.<job>',
    $ScriptName = 'scriptname.ps1',

    $UploadScript = $false,
    $ScriptBlock = {
        <Script to run locally on VMs>
    }
)

################
################
#
# DO NOT CHANGE BELOW
#
################
################

function Invoke-AzureRmVmScript {
<#

    # Vikingur Saemundsson @ Xenit AB
    # Credit to source https://github.com/RamblingCookieMonster/PowerShell/blob/master/Invoke-AzureRmVmScript.ps1
    # Made som small modifications to allow control over if the scriptfile is uploaded or not to avoid extra data to containers and shorten the executiontime
    #

    .FUNCTIONALITY
        Azure
#>
    [cmdletbinding()]
    param(
        # todo: add various parameter niceties
        [Parameter(Mandatory = $True,
                    Position = 0,
                    ValueFromPipelineByPropertyName = $True)]
        [string[]]$ResourceGroupName,

        [Parameter(Mandatory = $True,
                    Position = 1,
                    ValueFromPipelineByPropertyName = $True)]
        [string[]]$VMName,

        [Parameter(Mandatory = $True,
                    Position = 2)]
        [scriptblock]$ScriptBlock, #todo: add file support.

        [Parameter(Mandatory = $True,
                    Position = 3)]
        [string]$StorageAccountName,

        [string]$StorageAccountKey, #Maybe don't use string...

        $StorageContext,

        [string]$StorageContainer = 'sc-scripts',

        [string]$Filename, # Auto defined if not specified...

        [string]$ExtensionName, # Auto defined if not specified

        [bool]$UploadScript = $true,

        [switch]$ForceExtension,
        [switch]$ForceBlob,
        [switch]$Force
    )
    begin
    {
        if($Force)
        {
            $ForceExtension = $True
            $ForceBlob = $True
        }
    }
    process
    {
        Foreach($ResourceGroup in $ResourceGroupName)
        {
            Foreach($VM in $VMName)
            {
                if(-not $Filename)
                {
                    $GUID = [GUID]::NewGuid().Guid -replace "-", "_"
                    $FileName = "$GUID.ps1"
                }
                if(-not $ExtensionName)
                {
                    $ExtensionName = $Filename -replace '.ps1', ''
                }

                $CommonParams = @{
                    ResourceGroupName = $ResourceGroup
                    VMName = $VM
                }

                Write-Verbose "Working with ResourceGroup $ResourceGroup, VM $VM"
                # Why would Get-AzureRMVmCustomScriptExtension support listing extensions regardless of name? /grumble
                Try
                {
                    $AzureRmVM = Get-AzureRmVM @CommonParams -ErrorAction Stop
                    $AzureRmVMExtended = Get-AzureRmVM @CommonParams -Status -ErrorAction Stop
                }
                Catch
                {
                    Write-Error $_
                    Write-Error "Failed to retrieve existing extension data for $VM"
                    continue
                }

                # Handle existing extensions
                Write-Verbose "Checking for existing extensions on VM '$VM' in resource group '$ResourceGroup'"
                $Extensions = $null
                $Extensions = @( $AzureRmVMExtended.Extensions | Where {$_.Type -like 'Microsoft.Compute.CustomScriptExtension'} )
                if($Extensions.count -gt 0)
                {
                    Write-Verbose "Found extensions on $VM`:`n$($Extensions | Format-List | Out-String)"
                    if(-not $ForceExtension)
                    {
                        Write-Warning "Found CustomScriptExtension '$($Extensions.Name)' on VM '$VM' in Resource Group '$ResourceGroup'.`n Use -ForceExtension or -Force to remove this"
                        continue
                    }
                    Try
                    {
                        # Theoretically can only be one, so... no looping, just remove.
                        $Output = Remove-AzureRmVMCustomScriptExtension @CommonParams -Name $Extensions.Name -Force -ErrorAction Stop
                        if($Output.StatusCode -notlike 'OK')
                        {
                            Throw "Remove-AzureRmVMCustomScriptExtension output seems off:`n$($Output | Format-List | Out-String)"
                        }
                    }
                    Catch
                    {
                        Write-Error $_
                        Write-Error "Failed to remove existing extension $($Extensions.Name) for VM '$VM' in ResourceGroup '$ResourceGroup'"
                        continue
                    }
                }

                if(-not $StorageContainer)
                {
                    $StorageContainer = 'scripts'
                }
                if(-not $Filename)
                {
                    $Filename = 'CustomScriptExtension.ps1'
                }
                if(-not $StorageContext)
                {
                    if(-not $StorageAccountKey)
                    {
                        Try
                        {
                            $StorageAccountKey = (Get-AzureRmStorageAccountKey -ResourceGroupName $ResourceGroup -Name $storageAccountName -ErrorAction Stop)[0].value
                        }
                        Catch
                        {
                            Write-Error $_
                            Write-Error "Failed to obtain Storage Account Key for storage account '$StorageAccountName' in Resource Group '$ResourceGroup' for VM '$VM'"
                            continue
                        }
                    }
                    Try
                    {
                        $StorageContext = New-AzureStorageContext -StorageAccountName $StorageAccountName -StorageAccountKey $StorageAccountKey
                    }
                    Catch
                    {
                        Write-Error $_
                        Write-Error "Failed to generate storage context for storage account '$StorageAccountName' in Resource Group '$ResourceGroup' for VM '$VM'"
                        continue
                    }
                }
                If($UploadScript){
                    Write-Verbose "Uploading script to storage account $StorageAccountName"
                    Try
                    {
                        $Script = $ScriptBlock.ToString()
                        $LocalFile = [System.IO.Path]::GetTempFileName()
                        Start-Sleep -Milliseconds 500 #This might not be needed
                        Set-Content $LocalFile -Value $Script -ErrorAction Stop

                        $params = @{
                            Container = $StorageContainer
                            Context = $StorageContext
                        }

                        $Existing = $Null
                        $Existing = @( Get-AzureStorageBlob @params -ErrorAction Stop )

                        if($Existing.Name -contains $Filename -and -not $ForceBlob)
                        {
                            Write-Warning "Found blob '$FileName' in container '$StorageContainer'.`n Use -ForceBlob or -Force to overwrite this"
                            continue
                        }
                        $Output = Set-AzureStorageBlobContent @params -File $Localfile -Blob $Filename -ErrorAction Stop -Force
                        if($Output.Name -notlike $Filename)
                        {
                            Throw "Set-AzureStorageBlobContent output seems off:`n$($Output | Format-List | Out-String)"
                        }
                    }
                    Catch
                    {
                        Write-Error $_
                        Write-Error "Failed to generate or upload local script for VM '$VM' in Resource Group '$ResourceGroup'"
                        continue
                    }
                }

                # We have a script in place, set up an extension!
                Write-Verbose "Adding CustomScriptExtension to VM '$VM' in resource group '$ResourceGroup'"
                Try
                {
                    $Output = Set-AzureRmVMCustomScriptExtension -ResourceGroupName $ResourceGroup `
                                                                    -VMName $VM `
                                                                    -Location $AzureRmVM.Location `
                                                                    -FileName $Filename `
                                                                    -Run $Filename `
                                                                    -ContainerName $StorageContainer `
                                                                    -StorageAccountName $StorageAccountName `
                                                                    -StorageAccountKey $StorageAccountKey `
                                                                    -Name $ExtensionName `
                                                                    -TypeHandlerVersion 1.1 `
                                                                    -ErrorAction Stop

                    if($Output.StatusCode -notlike 'OK')
                    {
                        Throw "Set-AzureRmVMCustomScriptExtension output seems off:`n$($Output | Format-List | Out-String)"
                    }
                }
                Catch
                {
                    Write-Error $_
                    Write-Error "Failed to set CustomScriptExtension for VM '$VM' in resource group $ResourceGroup"
                    continue
                }

                # collect the output!
                Try
                {
                    $AzureRmVmOutput = $null
                    $AzureRmVmOutput = Get-AzureRmVM @CommonParams -Status -ErrorAction Stop
                    $SubStatuses = ($AzureRmVmOutput.Extensions | Where {$_.name -like $ExtensionName} ).substatuses
                }
                Catch
                {
                    Write-Error $_
                    Write-Error "Failed to retrieve script output data for $VM"
                    continue
                }

                $Output = [ordered]@{
                    ResourceGroupName = $ResourceGroup
                    VMName = $VM
                    Substatuses = $SubStatuses
                }

                foreach($Substatus in $SubStatuses)
                {
                    $ThisCode = $Substatus.Code -replace 'ComponentStatus/', '' -replace '/', '_'
                    $Output.add($ThisCode, $Substatus.Message)
                }

                [pscustomobject]$Output
            }
        }
    }
}
Try{
    #region Connection to Azure
    write-verbose "Connecting to Azure"
    $connectionName = "AzureRunAsConnection"

    try
    {
        # Get the connection "AzureRunAsConnection "
        $servicePrincipalConnection = Get-AutomationConnection -Name $connectionName

        "Logging in to Azure..."
        Add-AzureRmAccount `
            -ServicePrincipal `
            -TenantId $servicePrincipalConnection.TenantId `
            -ApplicationId $servicePrincipalConnection.ApplicationId `
            -CertificateThumbprint $servicePrincipalConnection.CertificateThumbprint
    }
    catch {
        if (!$servicePrincipalConnection)
        {
            $ErrorMessage = "Connection $connectionName not found."
            throw $ErrorMessage
        } else{
            Write-Error -Message $_.Exception.Message
            throw $_.Exception
        }
    }

    Select-AzureRmSubscription -SubscriptionId $SubscriptionID
    $RG = Get-AzureRmResourceGroup -Name $ResourceGroup
    Foreach($VMName in $VMNames){
        $AzureVM = Get-AzureRmVM -Name $VMName -ResourceGroupName $RG.ResourceGroupName

        $Params = @{
            ResourceGroupName = $ResourceGroup
            VMName = $AzureVM.Name
            StorageAccountName = $StorageAccount
            StorageAccountKey = $StorageAccountKey
            StorageContainer = $StorageContainer
            FileName = $ScriptName
            ExtensionName = $ExtensionName
            UploadScript = $UploadScript
        }

        Invoke-AzureRmVmScript @Params -ScriptBlock $ScriptBlock -Force -Verbose
    }
}
Catch{
    Write-Error -Message $_.Exception.Message
    Exit Throw $_
}
```
