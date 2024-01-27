import { useEffect, useRef, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { ChevronCompactDown, ChevronCompactUp } from "react-bootstrap-icons";
import { ToastContainer } from "react-toastify";

const SearchDropdown = ({
    placeholder,
    items,
    setItems,
    selectedItems,
    setSelectedItems,
  }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredItems, setFilteredItems] = useState([]);
    const dropdownRef = useRef(null);
    const [input, setInput] = useState("");
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setShowDropdown(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  
    const handleChange = (e) => {
      const value = e.target.value.toLowerCase();
  
      if (value === "") {
        setFilteredItems([]);
        setInput("");
      } else {
        setInput(value);
        setFilteredItems(
          items.filter((item) => {
            const fullName = `${item}`.toLowerCase();
  
            if (fullName.includes(" ")) {
              const parts = fullName.split(" ");
              return parts.some((part) => part.startsWith(value));
            } else {
              return fullName.startsWith(value);
            }
          })
        );
      }
      setShowDropdown(true);
    };
  
    const handleItemClick = (item) => {
      let newSelectedItems = [...selectedItems, item];
      let is = items.filter((i) => !newSelectedItems?.includes(i));
  
      setItems(is);
      setSelectedItems(newSelectedItems);
      setInput("");
      setShowDropdown(false);
    };
  
  
    return (
      <div className="px-0 py-0" style={{ marginTop: "0.5em", marginBottom: "0.5em" }}>
        <Row>
          {placeholder !== '' && <Col
            xs={4}
            className={`d-flex align-items-center justify-content-center`}
          >
            <p style={{ margin: "0px" }}>{placeholder}: </p>
          </Col>}
          <Col xs={placeholder===''? 12:8} className="position-relative">
            <div className="input-group ">
              <input
                type="text"
                className="form-control custom-input-text"
                placeholder={placeholder}
                onChange={handleChange}
                value={input}
                style={{ borderRight: 'none' }}
              />
              <span className="input-group-text custom-input-text" style={{ background: 'white' }}>
                {!showDropdown && (
                  <ChevronCompactDown
                    onClick={() => {
                      setShowDropdown(true);
                    }}
                  />
                )}
                {showDropdown && (
                  <ChevronCompactUp
                    onClick={() => {
                      setShowDropdown(false);
                    }}
                  />
                )}
              </span>
            </div>
          </Col>
        </Row>
        {showDropdown && (
          <div className="dropdown-container">
            <Row>
              {placeholder!=='' && <Col
                xs={4}
                className="d-flex justify-content-start align-items-center"
              ></Col>}
              <Col ref={dropdownRef} xs={placeholder===''?12:8} className={placeholder===''? "dropdown-content-noPlaceholder": "dropdown-content"}>
                {filteredItems.length > 0 && (
                  <ul className="list-group">
                    {filteredItems.map((item, index) => (
                      <li
                        className={`list-group-item`}
                        key={index}
                        onClick={() => handleItemClick(item)}
                        style={{cursor:"pointer"}}
                      >
                        {item
                          .toLowerCase()
                          .split(' ')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </li>
                    ))}
                  </ul>
                )}
                {input === "" && items.length > 0 && (
                  <ul className="list-group mt-2">
                    {items.map((item, index) => (
                      <li
                        className={`list-group-item`}
                        key={index}
                        style={{cursor:"pointer"}}
                        onClick={() => handleItemClick(item)}
                      >
                        {item
                          .toLowerCase()
                          .split(' ')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </li>
                    ))}
                  </ul>
                )}
                {filteredItems.length <= 0 && input.length !== 0 && (
                  <ul className="list-group mt-2">
                    <li className={`list-group-item`}>No results</li>
                  </ul>
                )}
              </Col>
            </Row>
          </div>
        )}
        <ToastContainer />
      </div>
    );
  };

  export default SearchDropdown;