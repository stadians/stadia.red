browser.browserAction.onClicked.addListener(async (activeTab) => {
    const url = browser.runtime.getURL("./.htm");
    console.log({ activeTab });
    if (activeTab.url === url) {
        return;
    }
    const matchingTabs = await browser.tabs.query({
        url: browser.runtime.getURL("*"),
    });
    if (matchingTabs.length > 0) {
        for (const [i, tab] of matchingTabs.sort((a, b) => a.id - b.id).entries()) {
            if (i === 0) {
                await browser.tabs.update(tab.id, { highlighted: true, active: true });
                await browser.windows.update(tab.windowId, { focused: true });
            }
            else {
                browser.tabs.update(tab.id, { highlighted: true });
            }
        }
    }
    else {
        await browser.tabs.create({ url });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYmFja2dyb3VuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFNBQWMsRUFBRSxFQUFFO0lBQ25FLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBRTNCLElBQUksU0FBUyxDQUFDLEdBQUcsS0FBSyxHQUFHLEVBQUU7UUFDekIsT0FBTztLQUNSO0lBRUQsTUFBTSxZQUFZLEdBQWUsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4RCxHQUFHLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO0tBQ2pDLENBQUMsQ0FBQztJQUVILElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDM0IsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUN6RSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ1gsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDdkUsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDL0Q7aUJBQU07Z0JBQ0wsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQ3BEO1NBQ0Y7S0FDRjtTQUFNO1FBQ0wsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7S0FDcEM7QUFDSCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImJyb3dzZXIuYnJvd3NlckFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXIoYXN5bmMgKGFjdGl2ZVRhYjogYW55KSA9PiB7XG4gIGNvbnN0IHVybCA9IGJyb3dzZXIucnVudGltZS5nZXRVUkwoXCIuLy5odG1cIik7XG5cbiAgY29uc29sZS5sb2coeyBhY3RpdmVUYWIgfSk7XG5cbiAgaWYgKGFjdGl2ZVRhYi51cmwgPT09IHVybCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IG1hdGNoaW5nVGFiczogQXJyYXk8YW55PiA9IGF3YWl0IGJyb3dzZXIudGFicy5xdWVyeSh7XG4gICAgdXJsOiBicm93c2VyLnJ1bnRpbWUuZ2V0VVJMKFwiKlwiKSxcbiAgfSk7XG5cbiAgaWYgKG1hdGNoaW5nVGFicy5sZW5ndGggPiAwKSB7XG4gICAgZm9yIChjb25zdCBbaSwgdGFiXSBvZiBtYXRjaGluZ1RhYnMuc29ydCgoYSwgYikgPT4gYS5pZCAtIGIuaWQpLmVudHJpZXMoKSkge1xuICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgYXdhaXQgYnJvd3Nlci50YWJzLnVwZGF0ZSh0YWIuaWQsIHsgaGlnaGxpZ2h0ZWQ6IHRydWUsIGFjdGl2ZTogdHJ1ZSB9KTtcbiAgICAgICAgYXdhaXQgYnJvd3Nlci53aW5kb3dzLnVwZGF0ZSh0YWIud2luZG93SWQsIHsgZm9jdXNlZDogdHJ1ZSB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyb3dzZXIudGFicy51cGRhdGUodGFiLmlkLCB7IGhpZ2hsaWdodGVkOiB0cnVlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBhd2FpdCBicm93c2VyLnRhYnMuY3JlYXRlKHsgdXJsIH0pO1xuICB9XG59KTtcblxuZXhwb3J0IHt9O1xuIl19