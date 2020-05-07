"use strict";
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
      } else {
        browser.tabs.update(tab.id, { highlighted: true });
      }
    }
  } else {
    await browser.tabs.create({ url });
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYmFja2dyb3VuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxTQUFjLEVBQUUsRUFBRTtJQUNuRSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUU3QyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztJQUUzQixJQUFJLFNBQVMsQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFO1FBQ3pCLE9BQU87S0FDUjtJQUVELE1BQU0sWUFBWSxHQUFlLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDeEQsR0FBRyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztLQUNqQyxDQUFDLENBQUM7SUFFSCxJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQzNCLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDekUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNYLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3ZFLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQy9EO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUNwRDtTQUNGO0tBQ0Y7U0FBTTtRQUNMLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO0FBQ0gsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJicm93c2VyLmJyb3dzZXJBY3Rpb24ub25DbGlja2VkLmFkZExpc3RlbmVyKGFzeW5jIChhY3RpdmVUYWI6IGFueSkgPT4ge1xuICBjb25zdCB1cmwgPSBicm93c2VyLnJ1bnRpbWUuZ2V0VVJMKFwiLi8uaHRtXCIpO1xuXG4gIGNvbnNvbGUubG9nKHsgYWN0aXZlVGFiIH0pO1xuXG4gIGlmIChhY3RpdmVUYWIudXJsID09PSB1cmwpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBtYXRjaGluZ1RhYnM6IEFycmF5PGFueT4gPSBhd2FpdCBicm93c2VyLnRhYnMucXVlcnkoe1xuICAgIHVybDogYnJvd3Nlci5ydW50aW1lLmdldFVSTChcIipcIiksXG4gIH0pO1xuXG4gIGlmIChtYXRjaGluZ1RhYnMubGVuZ3RoID4gMCkge1xuICAgIGZvciAoY29uc3QgW2ksIHRhYl0gb2YgbWF0Y2hpbmdUYWJzLnNvcnQoKGEsIGIpID0+IGEuaWQgLSBiLmlkKS5lbnRyaWVzKCkpIHtcbiAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgIGF3YWl0IGJyb3dzZXIudGFicy51cGRhdGUodGFiLmlkLCB7IGhpZ2hsaWdodGVkOiB0cnVlLCBhY3RpdmU6IHRydWUgfSk7XG4gICAgICAgIGF3YWl0IGJyb3dzZXIud2luZG93cy51cGRhdGUodGFiLndpbmRvd0lkLCB7IGZvY3VzZWQ6IHRydWUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicm93c2VyLnRhYnMudXBkYXRlKHRhYi5pZCwgeyBoaWdobGlnaHRlZDogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYXdhaXQgYnJvd3Nlci50YWJzLmNyZWF0ZSh7IHVybCB9KTtcbiAgfVxufSk7XG4iXX0=
