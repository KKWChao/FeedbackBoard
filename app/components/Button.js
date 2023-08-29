import React from "react";

export default function Button(props) {
  const extraClasses = props?.className || " ";
  return (
    <button
      {...props}
      disabled={props.disabled}
      className={
        " flex gap-2 items-center py-1 px-4 rounded-md  text-opacity-90 " +
        extraClasses +
        (props.primary ? " bg-blue-500 text-white" : " text-gray-600 ") +
        (props.disabled
          ? " text-opacity-70 bg-opacity-70 cursor-not-allowed "
          : " ")
      }
    />
  );
}
