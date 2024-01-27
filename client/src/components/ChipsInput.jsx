import { Form } from "react-bootstrap";

function ChipsInput(props) {
  return (
    <Form.Group className="mb-1">
      <ul className="chip-list">
        {props.values.map((item) => (
          <li key={item} className="chip">
            <span>{item}</span>
            <span
              className="chip-x"
              onClick={() => props.remove(props.field, item)}
            >
              X
            </span>
          </li>
        ))}
      </ul>
    </Form.Group>
  );
}

const Chips2 = ({ items, selectedItems, setItems, setSelectedItems }) => {
  return (
    <div>
      {selectedItems &&
        selectedItems.map((item, index) => (
          <span
            key={index}
            className="chip"
            style={{
              fontSize: 15,
              alignItems: "center",
              paddingTop: 0,
              paddingBottom: 0,
            }}
          >
            {item}
            <span
              className="chip-x"
              onClick={() => {
                const updatedItem = items.concat(item);
                const updatedSelectedItem = selectedItems.filter(
                  (selectedItem) => selectedItem !== item
                );
                setItems(updatedItem);
                setSelectedItems(updatedSelectedItem);
              }}
            >
              x
            </span>
          </span>
        ))}
    </div>
  );
};
export { ChipsInput, Chips2 };
