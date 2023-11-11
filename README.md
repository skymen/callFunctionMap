<img src="./src/icon.svg" width="100" /><br>
# Call Function Map <br>
Description <br>
<br>
Author: skymen <br>
<sub>Made using [c3ide2-framework](https://github.com/ConstructFund/c3ide2-framework) </sub><br>

## Table of Contents
- [Usage](#usage)
- [Examples Files](#examples-files)
- [Properties](#properties)
- [Actions](#actions)
- [Conditions](#conditions)
- [Expressions](#expressions)
---
## Usage
To build the addon, run the following commands:

```
npm i
node ./build.js
```

To run the dev server, run

```
npm i
node ./dev.js
```

The build uses the pluginConfig file to generate everything else.
The main files you may want to look at would be instance.js and scriptInterface.js

## Examples Files
- [POCEDD](./examples/POCEDD.c3p)
</br>

---
## Properties
| Property Name | Description | Type |
| --- | --- | --- |
| Automatic Mode | When enabled, the plugin will auto detect which functions to call based on the function name. If disabled, the user needs to define which functions to call in a map. | check |
| Maps | A list of map names, one per line. When auto mode is enabled, these will be used to auto fill the function names. | longtext |


---
## Actions
| Action | Description | Params
| --- | --- | --- |
| Add Function To Map | Add a function to a map. | Function Name             *(string)* <br>Map Name             *(string)* <br> |
| Remove Function From Map | Remove a function from a map. | Function Name             *(string)* <br>Map Name             *(string)* <br> |
| Clear Map | Clear a map. | Map Name             *(string)* <br> |
| Remove Function From All Maps | Remove a function from all maps. | Function Name             *(string)* <br> |
| Disable Function In Map | Enable a function in a map. | Function Name             *(string)* <br>Map Name             *(string)* <br>Enable             *(boolean)* <br> |
| Disable Function From All Maps | Enable a function from all maps. | Function Name             *(string)* <br>Enable             *(boolean)* <br> |
| Disable Map | Disable a map. | Map Name             *(string)* <br>Enable             *(boolean)* <br> |
| Call Map | Call a map. | Map Name             *(string)* <br>Forward Parameters             *(number)* <br> |


---
## Conditions
| Condition | Description | Params
| --- | --- | --- |
| Is Map Enabled | Check if a map is enabled. | Map Name *(string)* <br> |
| Is Function Enabled In Map | Check if a function is enabled in a map. | Function Name *(string)* <br>Map Name *(string)* <br> |
| Is Function Enabled | Check if a function is enabled. | Function Name *(string)* <br> |
| Does Map Exist | Check if a map exists. | Map Name *(string)* <br> |
| Does Function Exist | Check if a function exists. | Function Name *(string)* <br> |
| Is Function In Map | Check if a function is in a map. | Function Name *(string)* <br>Map Name *(string)* <br> |


---
## Expressions
| Expression | Description | Return Type | Params
| --- | --- | --- | --- |
