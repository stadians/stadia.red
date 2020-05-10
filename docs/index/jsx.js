const renderChild = (content) => {
  if (content === null || content === undefined) {
    return document.createElement("span");
  } else if (content instanceof Node) {
    return content;
  } else if (
    typeof content === "string" ||
    typeof content === "number" ||
    typeof content === "boolean"
  ) {
    return document.createTextNode(String(content));
  } else {
    const container = document.createDocumentFragment();
    for (const child of content) {
      container.appendChild(renderChild(child));
    }
    return container;
  }
};
export const createElement = (type, props, ...children) => {
  const style = props.styles;
  props = { ...props };
  delete props.styles;
  let el;
  if (typeof type === "string") {
    el = document.createElement(type);
    Object.assign(el, props);
    el.appendChild(renderChild(children));
  } else {
    el = type(Object.assign(props, { children }));
  }
  if (style) {
    Object.assign(el.style, style);
  }
  return el;
};
Object.assign(window, {
  JSX: {
    createElement,
  },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianN4LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJpbmRleC9qc3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxXQUFXLEdBQUcsQ0FBQyxPQUFtQixFQUFRLEVBQUU7SUFDaEQsSUFBSSxPQUFPLEtBQUssSUFBSSxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7UUFDN0MsT0FBTyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3ZDO1NBQU0sSUFBSSxPQUFPLFlBQVksSUFBSSxFQUFFO1FBQ2xDLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO1NBQU0sSUFDTCxPQUFPLE9BQU8sS0FBSyxRQUFRO1FBQzNCLE9BQU8sT0FBTyxLQUFLLFFBQVE7UUFDM0IsT0FBTyxPQUFPLEtBQUssU0FBUyxFQUM1QjtRQUNBLE9BQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUNqRDtTQUFNO1FBQ0wsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDcEQsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLEVBQUU7WUFDM0IsU0FBUyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUMzQztRQUNELE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLENBQzNCLElBQW1FLEVBQ25FLEtBQTBCLEVBQzFCLEdBQUcsUUFBMkIsRUFDakIsRUFBRTtJQUNmLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDM0IsS0FBSyxHQUFHLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQztJQUNyQixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFFcEIsSUFBSSxFQUFFLENBQUM7SUFDUCxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtRQUM1QixFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6QixFQUFFLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0tBQ3ZDO1NBQU07UUFDTCxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQy9DO0lBRUQsSUFBSSxLQUFLLEVBQUU7UUFDVCxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDaEM7SUFFRCxPQUFPLEVBQUUsQ0FBQztBQUNaLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO0lBQ3BCLEdBQUcsRUFBRTtRQUNILGFBQWE7S0FDZDtDQUNGLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB0eXBlIFJlbmRlcmFibGUgPSBKU1guUmVuZGVyYWJsZTtcblxuY29uc3QgcmVuZGVyQ2hpbGQgPSAoY29udGVudDogUmVuZGVyYWJsZSk6IE5vZGUgPT4ge1xuICBpZiAoY29udGVudCA9PT0gbnVsbCB8fCBjb250ZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gIH0gZWxzZSBpZiAoY29udGVudCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfSBlbHNlIGlmIChcbiAgICB0eXBlb2YgY29udGVudCA9PT0gXCJzdHJpbmdcIiB8fFxuICAgIHR5cGVvZiBjb250ZW50ID09PSBcIm51bWJlclwiIHx8XG4gICAgdHlwZW9mIGNvbnRlbnQgPT09IFwiYm9vbGVhblwiXG4gICkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShTdHJpbmcoY29udGVudCkpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNvbnRlbnQpIHtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJDaGlsZChjaGlsZCkpO1xuICAgIH1cbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgY3JlYXRlRWxlbWVudCA9IChcbiAgdHlwZTogc3RyaW5nIHwgKChwcm9wczogUmVjb3JkPHN0cmluZywgUmVuZGVyYWJsZT4pID0+IEhUTUxFbGVtZW50KSxcbiAgcHJvcHM6IFJlY29yZDxzdHJpbmcsIGFueT4sXG4gIC4uLmNoaWxkcmVuOiBBcnJheTxSZW5kZXJhYmxlPlxuKTogSFRNTEVsZW1lbnQgPT4ge1xuICBjb25zdCBzdHlsZSA9IHByb3BzLnN0eWxlcztcbiAgcHJvcHMgPSB7IC4uLnByb3BzIH07XG4gIGRlbGV0ZSBwcm9wcy5zdHlsZXM7XG5cbiAgbGV0IGVsO1xuICBpZiAodHlwZW9mIHR5cGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSk7XG4gICAgT2JqZWN0LmFzc2lnbihlbCwgcHJvcHMpO1xuICAgIGVsLmFwcGVuZENoaWxkKHJlbmRlckNoaWxkKGNoaWxkcmVuKSk7XG4gIH0gZWxzZSB7XG4gICAgZWwgPSB0eXBlKE9iamVjdC5hc3NpZ24ocHJvcHMsIHsgY2hpbGRyZW4gfSkpO1xuICB9XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgT2JqZWN0LmFzc2lnbihlbC5zdHlsZSwgc3R5bGUpO1xuICB9XG5cbiAgcmV0dXJuIGVsO1xufTtcblxuT2JqZWN0LmFzc2lnbih3aW5kb3csIHtcbiAgSlNYOiB7XG4gICAgY3JlYXRlRWxlbWVudCxcbiAgfSxcbn0pO1xuIl19
