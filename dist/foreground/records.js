// Returns a copy of a record with string keys sorted.
export const sorted = (record) => Object.fromEntries(Object.keys(record)
    .sort()
    .map(key => [key, record[key]]));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3Jkcy5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiZm9yZWdyb3VuZC9yZWNvcmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUN0RCxNQUFNLENBQUMsTUFBTSxNQUFNLEdBQUcsQ0FBZ0MsTUFBUyxFQUFLLEVBQUUsQ0FDcEUsTUFBTSxDQUFDLFdBQVcsQ0FDaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDaEIsSUFBSSxFQUFFO0tBQ04sR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FDbEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFJldHVybnMgYSBjb3B5IG9mIGEgcmVjb3JkIHdpdGggc3RyaW5nIGtleXMgc29ydGVkLlxuZXhwb3J0IGNvbnN0IHNvcnRlZCA9IDxUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55Pj4ocmVjb3JkOiBUKTogVCA9PlxuICBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmtleXMocmVjb3JkKVxuICAgICAgLnNvcnQoKVxuICAgICAgLm1hcChrZXkgPT4gW2tleSwgcmVjb3JkW2tleV1dKSxcbiAgKTtcbiJdfQ==