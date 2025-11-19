import { useEffect, useRef, useState, type EffectCallback } from "react"


export function useOnMountUnsafe(effect: EffectCallback) {
  const initializedCount = useRef(0);

  useEffect(() => {
    
    if (import.meta.env.DEV){
      if (initializedCount.current <= 1){
        initializedCount.current++;
        if (initializedCount.current === 2)   return effect();
      }
    }
    else{
      return effect();
    }
    
  }, [])
}


export function useModalState(defaultValue:boolean){
    const [ show , setShow ] = useState(defaultValue);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return { show, setShow, handleClose, handleShow};
}

export function setIntervalImmediate(cb:TimerHandler,timeout:number,...args:any[]){
  if (typeof cb == 'string')  return ;
  
  cb(...args);
  return setInterval(cb,timeout,args);
}