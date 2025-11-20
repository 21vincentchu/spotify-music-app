import RatingsIcon from "../../icons/RatingsIcon.png";

export default function StarIcon({ filled, size = 24 }) {
  return (
    <img
      src={RatingsIcon}
      alt="star"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: filled
          ? "brightness(0)"         // black fill
          : "brightness(10)",      // white star
        // black outline for hollow stars
        WebkitFilter: filled
          ? "brightness(0)"
          : "brightness(10) drop-shadow(0 0 1px black)",
      }}
    />
  );
}
