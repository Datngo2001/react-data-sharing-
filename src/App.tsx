import React, {
  createContext,
  useContext,
  useState,
  useReducer,
  useRef,
  useEffect,
} from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { createStore } from 'redux';

// Context API Setup
const DataContext = createContext<string | undefined>(undefined);

// Redux Setup
const initialState = { sharedData: 'Redux Data' };
const reducer = (
  state = initialState,
  action: { type: string; payload?: string }
) => {
  switch (action.type) {
    case 'UPDATE_DATA':
      return { ...state, sharedData: action.payload };
    default:
      return state;
  }
};
const store = createStore(reducer);

// Custom Hook
const useSharedState = () => {
  const [data, setData] = useState('Shared Data via Custom Hook');
  return { data, setData };
};

// Event Bus Setup
const useEventBus = () => {
  const events: { [key: string]: ((data: any) => void)[] } = {};

  const emit = (event: string, data: any) => {
    (events[event] || []).forEach((callback) => callback(data));
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (!events[event]) events[event] = [];
    events[event].push(callback);
  };

  return { emit, on };
};

const eventBus = useEventBus();

const App: React.FC = () => {
  const [customHookData, setCustomHookData] = useSharedState();

  return (
    <Provider store={store}>
      <DataContext.Provider value="Data from Context">
        <Parent
          setCustomHookData={setCustomHookData}
          customHookData={customHookData}
        />
      </DataContext.Provider>
    </Provider>
  );
};

const Parent: React.FC<{
  setCustomHookData: React.Dispatch<React.SetStateAction<string>>;
  customHookData: string;
}> = ({ setCustomHookData, customHookData }) => {
  const contextData = useContext(DataContext);
  const reduxData = useSelector((state: any) => state.sharedData);
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    eventBus.on('eventBusData', (data: string) => {
      console.log('EventBus Data Received:', data);
    });
  }, []);

  return (
    <div>
      <h1>React App: Data Sharing</h1>
      <div>
        <h2>1. Props (Parent to Child)</h2>
        <Child message="Hello from Parent!" />
      </div>
      <div>
        <h2>2. Callback Function (Child to Parent)</h2>
        <ChildWithCallback
          sendData={(data) => console.log('Data from Child:', data)}
        />
      </div>
      <div>
        <h2>3. Context API</h2>
        <p>Data: {contextData}</p>
      </div>
      <div>
        <h2>4. Redux</h2>
        <p>Data: {reduxData}</p>
        <button
          onClick={() =>
            dispatch({ type: 'UPDATE_DATA', payload: 'Updated Redux Data' })
          }
        >
          Update Redux Data
        </button>
      </div>
      <div>
        <h2>5. Custom Hook</h2>
        <p>Data: {customHookData}</p>
        <button onClick={() => setCustomHookData('Updated Custom Hook Data')}>
          Update Custom Hook Data
        </button>
      </div>
      <div>
        <h2>6. Event Bus</h2>
        <button
          onClick={() => eventBus.emit('eventBusData', 'Hello from Event Bus!')}
        >
          Emit Event
        </button>
      </div>
      <div>
        <h2>7. Refs</h2>
        <input ref={inputRef} type="text" placeholder="Type here" />
        <button onClick={() => inputRef.current?.focus()}>Focus Input</button>
      </div>
    </div>
  );
};

const Child: React.FC<{ message: string }> = ({ message }) => {
  return <p>Message: {message}</p>;
};

const ChildWithCallback: React.FC<{ sendData: (data: string) => void }> = ({
  sendData,
}) => {
  return (
    <button onClick={() => sendData('Data from Child!')}>
      Send Data to Parent
    </button>
  );
};

export default App;
