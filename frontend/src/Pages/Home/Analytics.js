import React from "react";
// import CardBox from "./CardBox";
import { Container, Row } from "react-bootstrap";
import CircularProgressBar from "../../components/CircularProgressBar";
import LineProgressBar from "../../components/LineProgressBar";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
// import MovingIcon from '@mui/icons-material/Moving';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';


const Analytics = ({ transactions, type = "all" }) => {
  const TotalTransactions = transactions.length;
  const totalIncomeTransactions = transactions.filter(
    (item) => item.transactionType === "credit"
  );
  const totalExpenseTransactions = transactions.filter(
    (item) => item.transactionType === "expense"
  );

  let totalIncomePercent =
    (totalIncomeTransactions.length / TotalTransactions) * 100;
  let totalExpensePercent =
    (totalExpenseTransactions.length / TotalTransactions) * 100;

  // console.log(totalIncomePercent, totalExpensePercent);

  const totalTurnOver = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );
  const totalTurnOverIncome = transactions
    .filter((item) => item.transactionType === "credit")
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const totalTurnOverExpense = transactions
    .filter((item) => item.transactionType === "expense")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const TurnOverIncomePercent = (totalTurnOverIncome / totalTurnOver) * 100;
  const TurnOverExpensePercent = (totalTurnOverExpense / totalTurnOver) * 100;

  const categories = [
    "Groceries",
    "Rent",
    "Salary",
    "Tip",
    "Food",
    "Medical",
    "Utilities",
    "Entertainment",
    "Transportation",
    "Other",
  ];

  const colors = {
    "Groceries": '#FF6384',
    "Rent": '#36A2EB',
    "Salary": '#FFCE56',
    "Tip": '#4BC0C0',
    "Food": '#9966FF',
    "Medical": '#FF9F40',
    "Utilities": '#8AC926',
    "Entertainment": '#6A4C93',
    "Transportation": '#1982C4',
    "Other": '#F45B69',
  };

  // Pie chart data for category-wise expenses
  const expensePieData = categories.map(category => {
    const value = transactions.filter(t => t.transactionType === "expense" && t.category === category).reduce((acc, t) => acc + t.amount, 0);
    return { name: category, value };
  }).filter(d => d.value > 0);

  // Bar chart data for monthly spending
  const monthlyData = {};
  transactions.forEach(t => {
    if (t.transactionType === "expense") {
      const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyData[month] = (monthlyData[month] || 0) + t.amount;
    }
  });
  const barData = Object.entries(monthlyData).map(([month, value]) => ({ month, value }));

  // Top 3 categories by expense
  const topCategories = [...expensePieData].sort((a, b) => b.value - a.value).slice(0, 3);

  // Biggest expense
  const biggestExpense = transactions.filter(t => t.transactionType === "expense").sort((a, b) => b.amount - a.amount)[0];

  // Pie chart data for category-wise income
  const incomePieData = categories.map(category => {
    const value = transactions.filter(t => t.transactionType === "credit" && t.category === category).reduce((acc, t) => acc + t.amount, 0);
    return { name: category, value };
  }).filter(d => d.value > 0);

  // Bar chart data for monthly income
  const monthlyIncomeData = {};
  transactions.forEach(t => {
    if (t.transactionType === "credit") {
      const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyIncomeData[month] = (monthlyIncomeData[month] || 0) + t.amount;
    }
  });
  const incomeBarData = Object.entries(monthlyIncomeData).map(([month, value]) => ({ month, value }));

  // Top 3 categories by income
  const topIncomeCategories = [...incomePieData].sort((a, b) => b.value - a.value).slice(0, 3);

  // Biggest income
  const biggestIncome = transactions.filter(t => t.transactionType === "credit").sort((a, b) => b.amount - a.amount)[0];

  return (
    <>
      <Container className="mt-5 ">
        <div className="dashboard-grid">
          <div>
            <div className="card h-100">
              <div className="card-header bg-black text-white">
                <span style={{ fontWeight: "bold" }}>Total Transactions:</span>{' '}
                <span className="stat-badge">{TotalTransactions}</span>
              </div>
              <div className="card-body">
                <h5 className="card-title " style={{ color: "green" }}>
                  Income: <ArrowDropUpIcon /> <span style={{ color: '#36A2EB', fontWeight: 700 }}>{totalIncomeTransactions.length}</span>
                </h5>
                <h5 className="card-title" style={{ color: "red" }}>
                  Expense: <ArrowDropDownIcon /> <span style={{ color: '#FF6384', fontWeight: 700 }}>{totalExpenseTransactions.length}</span>
                </h5>
                <div className="d-flex justify-content-center mt-3">
                  <CircularProgressBar
                    percentage={totalIncomePercent.toFixed(0)}
                    color="green"
                  />
                </div>
                <div className="d-flex justify-content-center mt-4 mb-2">
                  <CircularProgressBar
                    percentage={totalExpensePercent.toFixed(0)}
                    color="red"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="card h-100">
              <div className="card-header bg-black text-white ">
                <span style={{ fontWeight: "bold" }}>Total TurnOver:</span>{' '}
                <span className="stat-badge">₹{totalTurnOver}</span>
              </div>
              <div className="card-body">
                <h5 className="card-title" style={{ color: "green" }}>Income: <ArrowDropUpIcon /> <span style={{ color: '#36A2EB', fontWeight: 700 }}>₹{totalTurnOverIncome}</span></h5>
                <h5 className="card-title" style={{ color: "red" }}>Expense: <ArrowDropDownIcon /><span style={{ color: '#FF6384', fontWeight: 700 }}>₹{totalTurnOverExpense}</span></h5>
                <div className="d-flex justify-content-center mt-3">
                  <CircularProgressBar
                    percentage={TurnOverIncomePercent.toFixed(0)}
                    color="green"
                  />
                </div>
                <div className="d-flex justify-content-center mt-4 mb-4">
                  <CircularProgressBar
                    percentage={TurnOverExpensePercent.toFixed(0)}
                    color="red"
                  />
                </div>
              </div>
            </div>
          </div>

          {(type === "all" || type === "credit") && (
            <div>
              <div className="card h-100">
                <div className="card-header  bg-black text-white">
                  <span style={{ fontWeight: "bold" }}>Categorywise Income</span>{" "}
                </div>
                <div className="card-body">
                  {categories.map(category => {
                    const income = transactions.filter(transaction => transaction.transactionType === "credit" && transaction.category === category).reduce((acc, transaction) => acc + transaction.amount, 0)
                    const incomePercent = (income / totalTurnOver) * 100;
                    return (
                      <>
                        {income > 0 &&
                          (<LineProgressBar label={category} percentage={incomePercent.toFixed(0)} lineColor={colors[category]} />)
                        }
                      </>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {(type === "all" || type === "expense") && (
            <div>
              <div className="card h-100">
                <div className="card-header  bg-black text-white">
                  <span style={{ fontWeight: "bold" }}>Categorywise Expense</span>{" "}
                </div>
                <div className="card-body">
                  {categories.map(category => {
                    const expenses = transactions.filter(transaction => transaction.transactionType === "expense" && transaction.category === category).reduce((acc, transaction) => acc + transaction.amount, 0)
                    const expensePercent = (expenses / totalTurnOver) * 100;
                    return (
                      <>
                        {expenses > 0 &&
                          (<LineProgressBar label={category} percentage={expensePercent.toFixed(0)} lineColor={colors[category]} />)
                        }
                      </>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {(type === "all" || type === "expense") && <>
            <div>
              <div className="card h-100">
                <div className="card-header bg-black text-white">
                  <span style={{ fontWeight: "bold" }}>Category-wise Expenses (Pie Chart)</span>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={expensePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {expensePieData.map((entry, index) => (
                          <Cell key={`cell-expense-${index}`} fill={colors[entry.name] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div>
              <div className="card h-100">
                <div className="card-header bg-black text-white">
                  <span style={{ fontWeight: "bold" }}>Monthly Expenses (Bar Chart)</span>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#7c3aed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div>
              <div className="card h-100">
                <div className="card-header bg-black text-white">
                  <span style={{ fontWeight: "bold" }}>Top 3 Expense Categories</span>
                </div>
                <div className="card-body">
                  <ol>
                    {topCategories.map(cat => (
                      <li key={cat.name}>{cat.name}: ₹{cat.value}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            <div>
              <div className="card h-100">
                <div className="card-header bg-black text-white">
                  <span style={{ fontWeight: "bold" }}>Biggest Expense</span>
                </div>
                <div className="card-body">
                  {biggestExpense ? (
                    <div>
                      <strong>{biggestExpense.title}</strong> <br />
                      Category: {biggestExpense.category} <br />
                      Amount: ₹{biggestExpense.amount} <br />
                      Date: {new Date(biggestExpense.date).toLocaleDateString()}
                    </div>
                  ) : (
                    <div>No expenses yet.</div>
                  )}
                </div>
              </div>
            </div>
          </>}
          {(type === "all" || type === "credit") && <>
            <div>
              <div className="card h-100">
                <div className="card-header bg-black text-white">
                  <span style={{ fontWeight: "bold" }}>Category-wise Income (Pie Chart)</span>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={incomePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {incomePieData.map((entry, index) => (
                          <Cell key={`cell-income-${index}`} fill={colors[entry.name] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div>
              <div className="card h-100">
                <div className="card-header bg-black text-white">
                  <span style={{ fontWeight: "bold" }}>Monthly Income (Bar Chart)</span>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={incomeBarData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#36A2EB" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div>
              <div className="card h-100">
                <div className="card-header bg-black text-white">
                  <span style={{ fontWeight: "bold" }}>Top 3 Income Categories</span>
                </div>
                <div className="card-body">
                  <ol>
                    {topIncomeCategories.map(cat => (
                      <li key={cat.name}>{cat.name}: ₹{cat.value}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            <div>
              <div className="card h-100">
                <div className="card-header bg-black text-white">
                  <span style={{ fontWeight: "bold" }}>Biggest Income</span>
                </div>
                <div className="card-body">
                  {biggestIncome ? (
                    <div>
                      <strong>{biggestIncome.title}</strong> <br />
                      Category: {biggestIncome.category} <br />
                      Amount: ₹{biggestIncome.amount} <br />
                      Date: {new Date(biggestIncome.date).toLocaleDateString()}
                    </div>
                  ) : (
                    <div>No income yet.</div>
                  )}
                </div>
              </div>
            </div>
          </>}
        </div>
      </Container>
    </>
  );
};

export default Analytics;
