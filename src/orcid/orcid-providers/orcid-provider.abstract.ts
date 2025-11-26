export class OrcidProvider {
  nextProvider?: OrcidProvider
  setNext(provider: OrcidProvider): OrcidProvider {
    this.nextProvider = provider
    return provider
  }

  async getUserOrcid(username: string): Promise<string | undefined> {
    if (this.nextProvider) {
      return this.nextProvider.getUserOrcid(username)
    }
  }
}
