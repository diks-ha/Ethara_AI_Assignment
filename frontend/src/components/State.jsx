import React from "react";

export function Loading() {
  return <div className="state">Loading...</div>;
}

export function ErrorState({ message }) {
  return <div className="state error">Error: {message}</div>;
}
