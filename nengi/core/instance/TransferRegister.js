class TransferRegister {
	constructor() {
		this.transfers = new Map()
		this.expiry = 10000
	}

	add(transferKey, transferData) {
		this.transfers.set(transferKey, {
			key: transferKey,
			data: transferData,
			timestamp: Date.now()
		})
	}

	get(transferKey) {
		return this.transfers.get(transferKey)
	}

	delete(transferKey) {
		delete this.transfers.delete(transferKey)
	}

	update() {
		var now = Date.now()
		this.transfers.forEach(transfer => {
			if (transfer.timestamp > now + this.expiry) {
				this.transfers.delete(transferKey)
			}
		})
	}
}

module.exports = TransferRegister