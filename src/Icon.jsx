const Icon = ({ src, alt = 'icon', size = 40, onClick }) => {
  return (
    <img
      src={src}
      alt={alt}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
};

export default Icon;