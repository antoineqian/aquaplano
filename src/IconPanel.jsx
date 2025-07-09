import { useState } from "react";
import Modal from "./Modal";
import Icon from "./Icon";

const iconsData = [
  {
    id: "glass",
    src: "/assets/glass.png",
    alt: "Glass of water",
    title: "Potabilité",
    content: "L’eau en montagne n’est pas systématiquement potable. Même si elle paraît claire et pure, elle peut contenir des bactéries, virus, parasites, déjections animales ou polluants chimiques, notamment à proximité des pâturages, refuges ou villages de montagne."
  },
  {
    id: "pollution",
    src: "/assets/water-pollution.png",
    alt: "Water pollution",
    title: "Pollution",
    content: "En 2007, des pesticides étaient détectés dans 91 % des points de suivi des cours d’eau français.  Une étude de 2020 révèle que 36 % des échantillons de rivières, lacs ou étangs analysés étaient contaminés par au moins une substance perfluorée (PFAS)."
  },
  {
    id: "river",
    src: "/assets/river.png",
    alt: "River",
    title: "Débit",
    content: "44 % des plus grands fleuves du monde ont vu leur débit diminuer en 35 ans, principalement à cause du changement climatique et de la consommation accrue d’eau pour l’agriculture, l’industrie et l’urbanisation. Moins d’eau signifie une dilution moindre des polluants présents (pesticides, métaux lourds, résidus pharmaceutiques), ce qui augmente leur concentration dans les rivières et les nappes."
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