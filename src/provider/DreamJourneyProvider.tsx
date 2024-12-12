import React, { createContext, ReactNode, useEffect, useState } from 'react';
import DreamJourney from '../../packages/dreamJourney';

type Module = DreamJourney | null;

const DreamJourneyContext = createContext<{
  dreamJourneyInstance: Module;
  setInstance: ((moduleInstance: Module) => void) | null;
}>({ dreamJourneyInstance: null, setInstance: null });

const ModuleInstanceProvider = ({ children }: { children: ReactNode }) => {
  const [moduleInstance, _setModuleInstance] = useState<null | Module>(null);

  const setInstance = (module: Module | null) => {
    if (!module) return;
    if (moduleInstance) {
      moduleInstance.dispose();
    }

    _setModuleInstance(module);
  };

  return (
    <DreamJourneyContext.Provider
      value={{
        dreamJourneyInstance: moduleInstance,
        setInstance,
      }}
    >
      {children}
    </DreamJourneyContext.Provider>
  );
};

export default ModuleInstanceProvider;
export { DreamJourneyContext };
