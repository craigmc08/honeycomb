const Flex = (props) => {
  const style = {
    display: 'flex',
    flexDirection: props.flow,
    alignItems: 'center',
    gap: props.gap || 0,
  };
  if (props.spacing === Flex.Between) {
    style.justifyContent = 'space-between';
  }

  return (
    <div style={style}>
      {props.children}
    </div>
  )
}

Flex.Row = 'row';
Flex.Column = 'column';
Flex.Between = 'between';
Flex.Pack = 'pack';

export default Flex;
