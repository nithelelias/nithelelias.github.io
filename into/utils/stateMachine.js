export default function stateMachine(default_state, states) {
  var current_state = default_state;

  const set = (_state) => {
    if (!states.hasOwnProperty(_state)) {
      return false;
    }
    current_state = _state;
    return true;
  };

  const run = () => {
    if (!states.hasOwnProperty(current_state)) {
      set(default_state);
      return false;
    }
    states[current_state]();
  };

  return {
    set,
    run,
  };
}
