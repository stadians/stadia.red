const renderChild = (content) => {
    if (content === null || content === undefined) {
        return document.createElement("span");
    }
    else if (content instanceof Node) {
        return content;
    }
    else if (typeof content === "string" ||
        typeof content === "number" ||
        typeof content === "boolean") {
        return document.createTextNode(String(content));
    }
    else {
        const container = document.createDocumentFragment();
        for (const child of content) {
            container.appendChild(renderChild(child));
        }
        return container;
    }
};
export const render = (type, props, ...children) => {
    if (typeof type === "string") {
        const el = document.createElement(type);
        Object.assign(el, props);
        el.appendChild(renderChild(children));
        return el;
    }
    else {
        return type(Object.assign(props, { children }));
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJyZW5kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBV0EsTUFBTSxXQUFXLEdBQUcsQ0FBQyxPQUFtQixFQUFRLEVBQUU7SUFDaEQsSUFBSSxPQUFPLEtBQUssSUFBSSxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7UUFDN0MsT0FBTyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3ZDO1NBQU0sSUFBSSxPQUFPLFlBQVksSUFBSSxFQUFFO1FBQ2xDLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO1NBQU0sSUFDTCxPQUFPLE9BQU8sS0FBSyxRQUFRO1FBQzNCLE9BQU8sT0FBTyxLQUFLLFFBQVE7UUFDM0IsT0FBTyxPQUFPLEtBQUssU0FBUyxFQUM1QjtRQUNBLE9BQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUNqRDtTQUFNO1FBQ0wsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDcEQsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLEVBQUU7WUFDM0IsU0FBUyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUMzQztRQUNELE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sTUFBTSxHQUFHLENBQ3BCLElBQStELEVBQy9ELEtBQTBCLEVBQzFCLEdBQUcsUUFBMkIsRUFDckIsRUFBRTtJQUNYLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO1FBQzVCLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN0QyxPQUFPLEVBQUUsQ0FBQztLQUNYO1NBQU07UUFDTCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNqRDtBQUNILENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB0eXBlIFJlbmRlcmFibGUgPVxuICB8IEVsZW1lbnRcbiAgfCBEb2N1bWVudEZyYWdtZW50XG4gIHwgTm9kZVxuICB8IHN0cmluZ1xuICB8IG51bWJlclxuICB8IGJvb2xlYW5cbiAgfCBudWxsXG4gIHwgdW5kZWZpbmVkXG4gIHwgSXRlcmFibGU8UmVuZGVyYWJsZT47XG5cbmNvbnN0IHJlbmRlckNoaWxkID0gKGNvbnRlbnQ6IFJlbmRlcmFibGUpOiBOb2RlID0+IHtcbiAgaWYgKGNvbnRlbnQgPT09IG51bGwgfHwgY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICB9IGVsc2UgaWYgKGNvbnRlbnQgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH0gZWxzZSBpZiAoXG4gICAgdHlwZW9mIGNvbnRlbnQgPT09IFwic3RyaW5nXCIgfHxcbiAgICB0eXBlb2YgY29udGVudCA9PT0gXCJudW1iZXJcIiB8fFxuICAgIHR5cGVvZiBjb250ZW50ID09PSBcImJvb2xlYW5cIlxuICApIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoU3RyaW5nKGNvbnRlbnQpKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBjb250ZW50KSB7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVuZGVyQ2hpbGQoY2hpbGQpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHJlbmRlciA9IChcbiAgdHlwZTogc3RyaW5nIHwgKChwcm9wczogUmVjb3JkPHN0cmluZywgUmVuZGVyYWJsZT4pID0+IEVsZW1lbnQpLFxuICBwcm9wczogUmVjb3JkPHN0cmluZywgYW55PixcbiAgLi4uY2hpbGRyZW46IEFycmF5PFJlbmRlcmFibGU+XG4pOiBFbGVtZW50ID0+IHtcbiAgaWYgKHR5cGVvZiB0eXBlID09PSBcInN0cmluZ1wiKSB7XG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpO1xuICAgIE9iamVjdC5hc3NpZ24oZWwsIHByb3BzKTtcbiAgICBlbC5hcHBlbmRDaGlsZChyZW5kZXJDaGlsZChjaGlsZHJlbikpO1xuICAgIHJldHVybiBlbDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdHlwZShPYmplY3QuYXNzaWduKHByb3BzLCB7IGNoaWxkcmVuIH0pKTtcbiAgfVxufTtcbiJdfQ==