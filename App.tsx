import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRight, DollarSign, Users, Building, History, Send } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  balance: number;
}

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: Date;
  type: 'transfer' | 'bank_deposit' | 'bank_withdrawal';
}

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [startingBalance, setStartingBalance] = useState('1500');
  const [selectedTransferSourceId, setSelectedTransferSourceId] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem('monopoly-players');
    const savedTransactions = localStorage.getItem('monopoly-transactions');
    
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
    if (savedTransactions) {
      const parsed = JSON.parse(savedTransactions);
      setTransactions(parsed.map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) })));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('monopoly-players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('monopoly-transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Pre-fill transfer form when a player/bank is clicked
  useEffect(() => {
    if (showTransfer && selectedTransferSourceId) {
      setTransferFrom(selectedTransferSourceId);
      setSelectedTransferSourceId('');
    }
  }, [showTransfer, selectedTransferSourceId]);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        balance: parseInt(startingBalance) || 1500
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      setStartingBalance('1500');
      setShowAddPlayer(false);
    }
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleInitiateTransfer = (entityId: string) => {
    setSelectedTransferSourceId(entityId);
    setShowTransfer(true);
  };

  const executeTransfer = () => {
    const amount = parseInt(transferAmount);
    if (!amount || amount <= 0 || !transferFrom || !transferTo || transferFrom === transferTo) {
      return;
    }

    let fromPlayer: Player | undefined;
    let toPlayer: Player | undefined;
    let transactionType: 'transfer' | 'bank_deposit' | 'bank_withdrawal' = 'transfer';

    if (transferFrom === 'bank') {
      toPlayer = players.find(p => p.id === transferTo);
      transactionType = 'bank_deposit';
    } else if (transferTo === 'bank') {
      fromPlayer = players.find(p => p.id === transferFrom);
      transactionType = 'bank_withdrawal';
    } else {
      fromPlayer = players.find(p => p.id === transferFrom);
      toPlayer = players.find(p => p.id === transferTo);
    }

    // Check if sender has enough money (except bank)
    if (fromPlayer && fromPlayer.balance < amount) {
      alert(`${fromPlayer.name} doesn't have enough money!`);
      return;
    }

    // Update balances
    setPlayers(prev => prev.map(player => {
      if (player.id === transferFrom) {
        return { ...player, balance: player.balance - amount };
      }
      if (player.id === transferTo) {
        return { ...player, balance: player.balance + amount };
      }
      return player;
    }));

    // Add transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      from: transferFrom === 'bank' ? 'Bank' : fromPlayer?.name || '',
      to: transferTo === 'bank' ? 'Bank' : toPlayer?.name || '',
      amount,
      timestamp: new Date(),
      type: transactionType
    };
    setTransactions(prev => [transaction, ...prev]);

    // Reset form
    setTransferFrom('');
    setTransferTo('');
    setTransferAmount('');
    setShowTransfer(false);
  };

  const closeTransferModal = () => {
    setTransferFrom('');
    setTransferTo('');
    setTransferAmount('');
    setShowTransfer(false);
  };

  const quickAmount = (amount: number) => {
    setTransferAmount(amount.toString());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Glass Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="backdrop-blur-xl bg-white/70 shadow-lg border-b border-white/20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                <DollarSign className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Monopoly Wallet</h1>
                <p className="text-sm text-gray-600/80">{players.length} players active</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-3 bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20"
                title="Transaction History"
              >
                <History className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => setShowTransfer(!showTransfer)}
                className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 backdrop-blur-sm rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20"
                title="Send Money"
              >
                <Send className="w-5 h-5 text-green-700" />
              </button>
              <button
                onClick={() => setShowAddPlayer(!showAddPlayer)}
                className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 backdrop-blur-sm rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20"
                title="Add Player"
              >
                <Plus className="w-5 h-5 text-blue-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Add Player Modal */}
        {showAddPlayer && (
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl p-8 border border-white/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none"></div>
            <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Add New Player</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800/80 mb-2">Player Name</label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-900 placeholder-gray-500/70"
                  placeholder="Enter player name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800/80 mb-2">Starting Balance</label>
                <input
                  type="number"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-900 placeholder-gray-500/70"
                  placeholder="1500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowAddPlayer(false); setNewPlayerName(''); setStartingBalance('1500'); }}
                  className="px-6 py-3 text-gray-700 hover:bg-white/40 backdrop-blur-sm rounded-2xl transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={addPlayer}
                  disabled={!newPlayerName.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  Add Player
                </button>
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {showTransfer && (
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl p-8 border border-white/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none"></div>
            <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Send Money</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800/80 mb-2">From</label>
                  <select
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 text-gray-900"
                  >
                    <option value="">Select sender</option>
                    <option value="bank">🏦 Bank</option>
                    {players.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name} ({formatCurrency(player.balance)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800/80 mb-2">To</label>
                  <select
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 text-gray-900"
                  >
                    <option value="">Select recipient</option>
                    <option value="bank">🏦 Bank</option>
                    {players.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name} ({formatCurrency(player.balance)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800/80 mb-2">Amount</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 text-gray-900 placeholder-gray-500/70"
                  placeholder="Enter amount"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {[10, 20, 50, 100, 200, 500].map(amount => (
                    <button
                      key={amount}
                      onClick={() => quickAmount(amount)}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-700 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 font-medium"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={closeTransferModal}
                  className="px-6 py-3 text-gray-700 hover:bg-white/40 backdrop-blur-sm rounded-2xl transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={executeTransfer}
                  disabled={!transferFrom || !transferTo || !transferAmount || transferFrom === transferTo}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  Send Money
                </button>
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        {showHistory && (
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl p-8 border border-white/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none"></div>
            <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <History className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Transaction History</h3>
              {transactions.length > 0 && (
                <span className="text-sm text-gray-600/70 bg-white/40 px-3 py-1 rounded-full backdrop-blur-sm">({transactions.length} transactions)</span>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
              {transactions.length === 0 ? (
                <p className="text-gray-600/70 text-center py-8">No transactions yet</p>
              ) : (
                transactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/60 transition-all duration-300">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-900">{transaction.from}</span>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">{transaction.to}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {transaction.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            </div>
          </div>
        )}

        {/* Players Grid */}
        {players.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl p-12 text-center border border-white/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-300/50 to-gray-400/50 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <Users className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">No Players Added</h3>
              <p className="text-gray-600/80 mb-8 text-lg">Add players to start managing the Monopoly bank</p>
            <button
              onClick={() => setShowAddPlayer(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold text-lg"
            >
              <Plus className="w-6 h-6" />
              Add First Player
            </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map(player => (
              <div 
                key={player.id} 
                onClick={() => handleInitiateTransfer(player.id)}
                className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl p-8 border border-white/30 hover:shadow-3xl transition-all duration-500 hover:scale-105 relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">{player.name}</h3>
                    <p className="text-sm text-gray-600/70 font-medium">Player Balance</p>
                  </div>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all duration-300 backdrop-blur-sm"
                    onClick={(e) => { e.stopPropagation(); removePlayer(player.id); }}
                    title="Remove Player"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-3 ${player.balance < 0 ? 'bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent'}`}>
                    {formatCurrency(player.balance)}
                  </div>
                  {player.balance < 0 && (
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-700 text-xs rounded-full backdrop-blur-sm border border-red-500/20 font-semibold">
                      In Debt
                    </span>
                  )}
                </div>
                </div>
              </div>
            ))}
            
            {/* Bank Card */}
            <div 
              onClick={() => handleInitiateTransfer('bank')}
              className="backdrop-blur-xl bg-gradient-to-br from-green-500/90 to-emerald-600/90 rounded-3xl shadow-2xl p-8 text-white border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Building className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Bank</h3>
                  <p className="text-white/80 text-sm font-medium">Central Reserve</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-3 text-white drop-shadow-lg">∞</div>
                <p className="text-white/80 text-sm font-medium">Unlimited Balance</p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Send className="w-4 h-4 text-white" />
                </div>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;