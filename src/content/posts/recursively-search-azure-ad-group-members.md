---
title: Recursively search Azure Ad group members
date: 2017-12-11T10:50:20+01:00
modified: 2017-12-11T10:54:13+01:00
slug: recursively-search-azure-ad-group-members
permalink: /2017/12/11/recursively-search-azure-ad-group-members/
wpId: 734
description: "Reblogged from my company blog: https://tech.xenit.se/recursively-search-azure-ad-group-members/ — When working with on-premise Active Directory an administrator often has to recursively search AD groups, this is easy using the ActiveDirectory module with cmdlet “Get-AdGroupMember <Group> -Recusive”. For the AzureAD equivalent this is no longer an option, the cmdlet Get-AzureADGroupMember has three parameters. PARAMETERS -All <Boolean> If true,"
categories: []
tags: []
author: freakling
---

Reblogged from my company blog: [https://tech.xenit.se/recursively-search-azure-ad-group-members/](https://tech.xenit.se/recursively-search-azure-ad-group-members/)  
—  
When working with on-premise Active Directory an administrator often has to recursively search AD groups, this is easy using the ActiveDirectory module with cmdlet “Get-AdGroupMember <Group> -Recusive”.  
For the AzureAD equivalent this is no longer an option, the cmdlet Get-AzureADGroupMember has three parameters.

PARAMETERS  
\-All <Boolean>  
If true, return all group members. If false, return the number of objects specified by the Top parameter  
\-ObjectId <String>  
Specifies the ID of a group in Azure AD.  
\-Top <Int32>  
Specifies the maximum number of records to return.

As we can see there is no -recursive, in order to search recursively I’ve written the function below.

```powershell
Function Get-RecursiveAzureAdGroupMemberUsers{
[cmdletbinding()]
param(
   [parameter(Mandatory=$True,ValueFromPipeline=$true)]
   $AzureGroup
)
    Begin{
        If(-not(Get-AzureADCurrentSessionInfo)){Connect-AzureAD}
    }
    Process {
        Write-Verbose -Message "Enumerating $($AzureGroup.DisplayName)"
        $Members = Get-AzureADGroupMember -ObjectId $AzureGroup.ObjectId -All $true

        $UserMembers = $Members | Where-Object{$_.ObjectType -eq 'User'}
        If($Members | Where-Object{$_.ObjectType -eq 'Group'}){
            $UserMembers += $Members | Where-Object{$_.ObjectType -eq 'Group'} | ForEach-Object{ Get-RecursiveAzureAdGroupMemberUsers -AzureGroup $_}
        }
    }
    end {
        Return $UserMembers
    }
}
```

The function accepts groups by parameter or by pipeline and returns only the object type ‘User’

To run a recursive AzureAD Group member search simply pipe a normal ADgroup search as below

```powershell
Get-AzureADGroup -SearchString 'AzureADGroupName' | Get-RecursiveAzureAdGroupMemberUsers
```
