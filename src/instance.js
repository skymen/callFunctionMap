function getInstanceJs(parentClass, scriptInterface, addonTriggers, C3) {
  return class extends parentClass {
    constructor(inst, properties) {
      super(inst);

      this.auto = false;
      this.maps = new Map();
      this.functions = new Map();
      this.allFunctionsInProject = [];
      if (properties) {
        this.auto = properties[0];
        this.propertiesMapNames = properties[1].split("\n");
      }
      this._StartTicking();
    }

    Tick() {
      this._StopTicking();
      this.allFunctionsInProject = [
        ...this._runtime._eventSheetManager._functionBlocksByName.keys(),
      ];
      this.propertiesMapNames.forEach((map) => {
        this._InitMap(map);
      });
    }

    Release() {
      super.Release();
    }

    SaveToJson() {
      return {
        // data to be saved for savegames
      };
    }

    LoadFromJson(o) {
      // load state for savegames
    }

    Trigger(method) {
      super.Trigger(method);
      const addonTrigger = addonTriggers.find((x) => x.method === method);
      if (addonTrigger) {
        this.GetScriptInterface().dispatchEvent(new C3.Event(addonTrigger.id));
      }
    }

    GetScriptInterfaceClass() {
      return scriptInterface;
    }

    // =========== UTILS ===========
    _InitMap(mapName) {
      mapName = mapName.toLowerCase();
      if (this.maps.has(mapName)) {
        // check that any function has been added in the system map
        const mapObj = this.maps.get(mapName);
        const mapEntry = this._runtime
          .GetSystemPlugin()
          ._GetFunctionMap(mapName, false);
        if (mapEntry) {
          mapEntry.strMap.forEach((functionBlock, functionName) => {
            if (!mapObj.functions.has(functionName)) {
              mapObj.functions.set(functionName, {
                name: functionName,
                enabled: true,
              });
            }
          });
        }
      }
      const mapObj = {
        name: mapName,
        enabled: true,
        functions: new Map(),
      };
      this.maps.set(mapName, mapObj);
      const map = this.maps.get(mapName);

      // If map already exists in C3, add all functions to it
      const mapEntry = this._runtime
        .GetSystemPlugin()
        ._GetFunctionMap(mapName, true);
      if (mapEntry) {
        mapEntry.strMap.forEach((functionBlock, functionName) => {
          map.functions.set(functionName, {
            name: functionName,
            enabled: true,
          });
        });
      }

      if (this.auto) {
        // If auto, add all function whose name start with the map name, unless they already exist in the map
        this.allFunctionsInProject.forEach((functionName) => {
          if (functionName.startsWith(mapName)) {
            if (!map.functions.has(functionName)) {
              this._InitFunction(functionName);
              map.functions.set(functionName, {
                name: functionName,
                enabled: true,
              });
              this._DoMapFunction(
                mapName,
                functionName,
                this._runtime._eventSheetManager._functionBlocksByName.get(
                  functionName
                )
              );
            }
          }
        });
      }
    }

    _DoubleCheckMaps() {
      // check the system maps to see if any new maps have been added
      const that = this._runtime.GetSystemPlugin();
      const systemMaps = that._functionMaps;
      systemMaps.forEach((mapEntry, mapName) => {
        if (!this.maps.has(mapName.toLowerCase())) {
          this._InitMap(mapName);
        }
      });
    }

    _InitFunction(functionName) {
      functionName = functionName.toLowerCase();
      if (!this._DoesFunctionExist(functionName)) return;
      if (this.functions.has(functionName)) return;
      const functionObj = {
        name: functionName,
        enabled: true,
      };
      this.functions.set(functionName, functionObj);
    }

    _DoMapFunction(name, str, functionBlock) {
      const that = this._runtime.GetSystemPlugin();
      const mapEntry = that._GetFunctionMap(name.toLowerCase(), true);
      const strMap = mapEntry.strMap;
      const lowerStr = str.toLowerCase();
      if (strMap.has(lowerStr))
        console.warn(
          `[Construct] Function map '${name}' string '${str}' already in map; overwriting entry`
        );
      const firstFunctionBlock =
        C3.first(strMap.values()) || mapEntry.defaultFunc;
      if (firstFunctionBlock) {
        const firstReturnsValue = firstFunctionBlock.GetReturnType() !== 0;
        const curReturnsValue = functionBlock.GetReturnType() !== 0;
        if (firstReturnsValue !== curReturnsValue) {
          console.error(
            `[Construct] Function map '${name}' string '${str}' function return type not compatible with other functions in the map; entry ignored`
          );
          return;
        }
      }
      strMap.set(lowerStr, functionBlock);
    }

    _DoRemoveFunctionFromMap(name, str) {
      const that = this._runtime.GetSystemPlugin();
      const mapEntry = that._GetFunctionMap(name.toLowerCase(), false);
      if (!mapEntry) {
        console.warn(
          `[Construct] Remove mapped function: map name '${name}' not found; remove ignored`
        );
        return;
      }
      const strMap = mapEntry.strMap;
      const lowerStr = str.toLowerCase();
      if (!strMap.has(lowerStr)) {
        console.warn(
          `[Construct] Remove mapped function: map name '${name}' string '${str}' not found; remove ignored`
        );
        return;
      }
      strMap.delete(lowerStr);
    }

    // =========== ACTS ===========

    _AddFunctionToMap(functionName, mapName) {
      functionName = functionName.toLowerCase();
      mapName = mapName.toLowerCase();
      if (!this._DoesFunctionExist(functionName)) return;
      this._InitMap(mapName);
      this._InitFunction(functionName);
      const map = this.maps.get(mapName);
      map.functions.set(functionName, {
        name: functionName,
        enabled: true,
      });
      this._DoMapFunction(
        mapName,
        functionName,
        this._runtime._eventSheetManager._functionBlocksByName.get(functionName)
      );
    }
    _RemoveFunctionFromMap(functionName, mapName) {
      functionName = functionName.toLowerCase();
      mapName = mapName.toLowerCase();
      if (!this._DoesFunctionExist(functionName)) return;
      this._InitMap(mapName);
      const map = this.maps.get(mapName);
      map.functions.delete(functionName);
      this._DoRemoveFunctionFromMap(mapName, functionName);
    }
    _ClearMap(mapName) {
      mapName = mapName.toLowerCase();
      this._InitMap(mapName);
      const map = this.maps.get(mapName);
      map.functions.forEach((func) => {
        this._RemoveFunctionFromMap(mapName, func.name);
      });
    }
    _RemoveFunctionFromAllMaps(functionName) {
      functionName = functionName.toLowerCase();
      if (!this._DoesFunctionExist(functionName)) return;
      this.maps.forEach((map) => {
        this._RemoveFunctionFromMap(map, functionName);
      });
    }
    _EnableFunctionInMap(functionName, mapName, state) {
      functionName = functionName.toLowerCase();
      mapName = mapName.toLowerCase();
      if (!this._DoesFunctionExist(functionName)) return;
      if (!this._IsFunctionInMap(functionName, mapName)) return;
      this._InitMap(mapName);
      const map = this.maps.get(mapName);
      const func = map.functions.get(functionName);
      if (func) func.enabled = !!state;
    }
    _EnableFunction(functionName, state) {
      functionName = functionName.toLowerCase();
      if (!this._DoesFunctionExist(functionName)) return;
      this._InitFunction(functionName);
      this.functions.get(functionName).enabled = !!state;
    }
    _EnableMap(mapName, state) {
      mapName = mapName.toLowerCase();
      this._InitMap(mapName);
      const map = this.maps.get(mapName);
      map.enabled = !!state;
    }
    _CallMap(name, forwardParams) {
      name = name.toLowerCase();
      this._InitMap(name);
      if (!this._IsMapEnabled(name)) return;
      const that = this._runtime.GetSystemPlugin();
      forwardParams = Math.floor(forwardParams);
      const mapEntry = that._GetFunctionMap(name, false);
      if (!mapEntry) {
        console.warn(
          `[Construct] Call mapped function: map name '${name}' not found; call ignored`
        );
        return;
      }
      for (let functionName of mapEntry.strMap.keys()) {
        let functionBlock = mapEntry.strMap.get(functionName);
        if (!this._IsFunctionEnabledInMap(functionName, name)) continue;
        if (!functionBlock)
          if (mapEntry.defaultFunc) {
            functionBlock = mapEntry.defaultFunc;
            forwardParams = 0;
          } else {
            continue;
          }
        if (!functionBlock.IsEnabled()) continue;
        if (functionBlock.GetReturnType() !== 0) {
          continue;
        }
        const runtime = that._runtime;
        const eventSheetManager = runtime.GetEventSheetManager();
        const currentEvent = eventSheetManager.GetCurrentEvent();
        const solModifiers = currentEvent.GetSolModifiersIncludingParents();
        const hasAnySolModifiers = solModifiers.length > 0;
        if (hasAnySolModifiers)
          if (functionBlock.IsCopyPicked())
            eventSheetManager.PushCopySol(solModifiers);
          else eventSheetManager.PushCleanSol(solModifiers);
        const paramResults = [];
        const callerFunctionBlock =
          eventSheetManager.FindFirstFunctionBlockParent(currentEvent);
        if (callerFunctionBlock) {
          if (callerFunctionBlock === functionBlock) {
            continue;
          }
          const callerParameters = callerFunctionBlock.GetFunctionParameters();
          for (
            let i = forwardParams, len = callerParameters.length;
            i < len;
            ++i
          )
            paramResults.push(callerParameters[i].GetValue());
        }
        const calleeParameters = functionBlock.GetFunctionParameters();
        for (
          let i = paramResults.length, len = calleeParameters.length;
          i < len;
          ++i
        )
          paramResults.push(calleeParameters[i].GetInitialValue());
        if (runtime.IsDebugging())
          that._DebugDoCallMappedFunction(
            eventSheetManager,
            functionBlock,
            paramResults,
            hasAnySolModifiers,
            solModifiers
          );
        else
          that._DoCallMappedFunction(
            eventSheetManager,
            functionBlock,
            paramResults,
            hasAnySolModifiers,
            solModifiers
          );
      }
    }

    // =========== CNDS ===========

    _IsMapEnabled(name) {
      name = name.toLowerCase();
      this._InitMap(name);
      const map = this.maps.get(name);
      return map.enabled;
    }
    _IsFunctionEnabledInMap(functionName, mapName) {
      functionName = functionName.toLowerCase();
      if (!this._DoesFunctionExist(functionName)) return false;
      mapName = mapName.toLowerCase();
      this._InitMap(mapName);
      const map = this.maps.get(mapName);
      const func = map.functions.get(functionName);
      return func.enabled && this._IsFunctionEnabled(functionName);
    }
    _IsFunctionEnabled(functionName) {
      functionName = functionName.toLowerCase();
      if (!this._DoesFunctionExist(functionName)) return false;
      this._InitFunction(functionName);
      const func = this.functions.get(functionName);
      return func.enabled;
    }
    _DoesMapExist(mapName) {
      this._DoubleCheckMaps();
      return this.maps.has(mapName.toLowerCase());
    }
    _DoesFunctionExist(functionName) {
      return this.allFunctionsInProject.includes(functionName.toLowerCase());
    }
    _IsFunctionInMap(functionName, mapName) {
      functionName = functionName.toLowerCase();
      if (!this._DoesFunctionExist(functionName)) return false;
      mapName = mapName.toLowerCase();
      this._InitMap(mapName);
      const map = this.maps.get(mapName);
      return map.functions.has(functionName);
    }

    // =========== EXPS ===========
  };
}
