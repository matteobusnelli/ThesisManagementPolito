import { ThreeCircles } from "react-loader-spinner";

function Loading() {
  return (
    <div className="loader-container">
      <ThreeCircles
        height="150"
        width="150"
        color="black"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
        ariaLabel="three-circles-rotating"
        outerCircleColor=""
        innerCircleColor=""
        middleCircleColor=""
      />
    </div>
  );
}
export default Loading;
