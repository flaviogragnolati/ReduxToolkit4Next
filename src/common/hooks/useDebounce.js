import _ from 'lodash';
import { useEffect , useCallback} from 'react';

const defaultOptions = {
  leading: false,
  trailing: true,
  maxWait: null
};
export default function useDebounce(
  callback,
  delay=1000,
  dependencies=[],
  options = defaultOptions
) {
    if (!_.isFunction(callback)) { 
        throw new Error('callback must be a function');
    }
    if (_.isInteger(delay)) { 
        throw new Error('delay must be a number');
    }
    if (!_.isArray(dependencies)){
        throw new Error('dependencies must be an array');
    }
    
    const debouncedCallback = _.debounce(callback,delay,options)
    
    useEffect(()=>{
        return debouncedCallback.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[] )

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(debouncedCallback,[...dependencies,callback,delay]);
}
