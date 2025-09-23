describe('Jest setup', () => {
  it('should run TypeScript tests', () => {
    const sum = (a: number, b: number): number => a + b
    expect(sum(1, 2)).toBe(3)
  })
})
