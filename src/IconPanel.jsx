import React, { useState } from "react";
import Modal from "./Modal";
import Icon from "./Icon";

const iconsData = [
  {
    id: "glass",
    src: "/assets/glass.png",
    alt: "Glass of water",
    title: "Drinking Water",
    content: "Not all clear water is safe to drink. Always purify it in the wild."
  },
  {
    id: "pollution",
    src: "/assets/water-pollution.png",
    alt: "Water pollution",
    title: "Pollution Alert",
    content: "44% of large rivers have lower flow rates, concentrating pollutants."
  },
  {
    id: "river",
    src: "/assets/river.png",
    alt: "River",
    title: "Rivers in Danger",
    content: "PFAS and other chemicals contaminate many French rivers."
  }
];

const IconPanel = () => {
  const [activeModalId, setActiveModalId] = useState(null);

  const openModal = (id) => {
    setActiveModalId(id)
    console.log(id);
  };
  const closeModal = () => setActiveModalId(null);

  const activeIconData = iconsData.find(icon => icon.id === activeModalId);

  return (
    <>
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          gap: "16px"
        }}
      >
        {iconsData.map((icon) => (
          <Icon
            key={icon.id}
            src={icon.src}
            alt={icon.alt}
            onClick={() => openModal(icon.id)}
          />
        ))}
      </div>

      <Modal isOpen={!!activeIconData} onClose={closeModal}>
        {activeIconData && (
          <>
            <h3>{activeIconData.title}</h3>
            <p>{activeIconData.content}</p>
          </>
        )}
      </Modal>
    </>
  );
};

export default IconPanel;