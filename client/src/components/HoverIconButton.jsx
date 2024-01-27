import { useState } from 'react';
import { Button } from 'react-bootstrap';

function HoverIconButton({ defaultIcon: DefaultIcon, hoverIcon: HoverIcon, className, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Button
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {isHovered ? <HoverIcon /> : <DefaultIcon />}
    </Button>
  );
}

export {HoverIconButton};
