const Icon = ({ src, alt = 'icon', size = 40 }) => {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
};

export default Icon;