import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container, Card } from "react-bootstrap";
import "./home.css";
import { addTransaction, getTransactions } from "../../utils/ApiRequest";
import axiosInstance from "../../utils/axiosInstance";  // Use axiosInstance here
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";
import Analytics from "./Analytics";
import { saveAs } from "file-saver";
import DashboardIcon from '@mui/icons-material/Dashboard';
import InsightsIcon from '@mui/icons-material/Insights';
import TableChartIcon from '@mui/icons-material/TableChart';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import ClockIcon from '@mui/icons-material/AccessTime';
import ListIcon from '@mui/icons-material/List';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';

const Home = () => {
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    theme: "dark",
  };

  const [cUser, setcUser] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const handleStartChange = (date) => setStartDate(date);
  const handleEndChange = (date) => setEndDate(date);
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setValues({
      title: "",
      amount: "",
      description: "",
      category: "",
      date: "",
      transactionType: "",
      isRecurring: false,
      recurringFrequency: "monthly",
    });
    setShow(true);
  };

  useEffect(() => {
    const checkUserAndAvatar = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (!user.isAvatarImageSet) {
          navigate("/setAvatar");
          return;
        }
        setcUser(user);
        setRefresh((prev) => !prev);
      } else {
        navigate("/login");
      }
    };

    checkUserAndAvatar();
  }, [navigate]);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
    isRecurring: false,
    recurringFrequency: "monthly",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChangeFrequency = (e) => setFrequency(e.target.value);
  const handleSetType = (e) => setType(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, amount, description, category, date, transactionType, isRecurring, recurringFrequency } = values;

    if (!title || !amount || !description || !category || !date || !transactionType) {
      toast.error("Please enter all the fields", toastOptions);
      return;
    }

    if (!cUser) {
      toast.error("User not authenticated", toastOptions);
      return;
    }

    setLoading(true);

    try {
      const { data } = await axiosInstance.post(addTransaction, {
        title,
        amount,
        description,
        category,
        date,
        transactionType,
        userId: cUser._id,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : null,
      });

      if (data.success) {
        toast.success(data.message, toastOptions);
        handleClose();
        setRefresh((prev) => !prev);
      } else {
        toast.error(data.message, toastOptions);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add transaction", toastOptions);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setType("all");
    setStartDate(null);
    setEndDate(null);
    setFrequency("365");
    setSearch("");
    setFilterCategory("");
  };

  useEffect(() => {
    if (!cUser) return;

    const fetchAllTransactions = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.post(getTransactions, {
          userId: cUser._id,
          frequency,
          startDate,
          endDate,
          type,
        });

        if (data.success) {
          setTransactions(data.transactions);
        } else {
          toast.error("Failed to fetch transactions", toastOptions);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error fetching transactions", toastOptions);
      }
      setLoading(false);
    };

    fetchAllTransactions();
  }, [refresh, frequency, endDate, type, startDate, cUser]);

  // Export CSV logic
  const handleExportCSV = () => {
    if (!transactions.length) {
      toast.error("No transactions to export", toastOptions);
      return;
    }
    const replacer = (key, value) => (value === null ? '' : value);
    const header = [
      "title",
      "amount",
      "description",
      "category",
      "date",
      "transactionType",
      "isRecurring",
      "recurringFrequency",
    ];
    const csv = [
      header.join(","),
      ...transactions.map(row =>
        header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(",")
      ),
    ].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "transactions.csv");
  };

  // Filtered transactions based on search and filters
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory ? t.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="main-dashboard-bg">
      <Header />
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: '2.5rem', marginTop: '2.2rem', marginBottom: '1.2rem' }}>
        <div className="dashboard-header" style={{ margin: 0, padding: 0, fontSize: '2.1rem' }}>
          <DashboardIcon style={{ fontSize: 36, color: 'var(--primary)', marginRight: 10 }} />
          Dashboard
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <Container style={{ position: "relative", zIndex: 2 }} className="mt-3">
          <Card className="filter-card sticky-filter-card mb-4">
            <div className="filterRow" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
              <Form.Group className="mb-0" controlId="formSelectFrequency">
                <Form.Label><ClockIcon style={{ fontSize: 18, marginRight: 4 }} /> Frequency</Form.Label>
                <Form.Select name="frequency" value={frequency} onChange={handleChangeFrequency}>
                  <option value="7">Last Week</option>
                  <option value="30">Last Month</option>
                  <option value="365">Last Year</option>
                  <option value="custom">Custom</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-0" controlId="formSelectType">
                <Form.Label><ListIcon style={{ fontSize: 18, marginRight: 4 }} /> Type</Form.Label>
                <Form.Select name="type" value={type} onChange={handleSetType}>
                  <option value="all">All</option>
                  <option value="expense">Expense</option>
                  <option value="credit">Earned</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-0 search-bar" controlId="formSearch">
                <Form.Label><SearchIcon style={{ fontSize: 18, marginRight: 4 }} /> Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by title, description, or category"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-0 category-filter" controlId="formCategoryFilter">
                <Form.Label><FolderIcon style={{ fontSize: 18, marginRight: 4 }} /> Category</Form.Label>
                <Form.Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option value="">All</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Rent">Rent</option>
                  <option value="Salary">Salary</option>
                  <option value="Tip">Tip</option>
                  <option value="Food">Food</option>
                  <option value="Medical">Medical</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <Button variant="primary" onClick={handleShow}>Add New</Button>
                <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
                  <FormatListBulletedIcon
                    sx={{ cursor: "pointer" }}
                    onClick={() => setView("table")}
                    className={view === "table" ? "iconActive" : "iconDeactive"}
                  />
                  <BarChartIcon
                    sx={{ cursor: "pointer" }}
                    onClick={() => setView("chart")}
                    className={view === "chart" ? "iconActive" : "iconDeactive"}
                  />
                </div>
              </div>
            </div>
          </Card>

          {frequency === "custom" && (
            <div className="date">
              <div className="form-group">
                <label htmlFor="startDate" className="text-white">
                  Start Date:
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartChange}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate" className="text-white">
                  End Date:
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndChange}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                />
              </div>
            </div>
          )}

          {view === "table" && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button variant="secondary" onClick={handleReset}>Reset Filter</Button>
              <Button variant="success" onClick={handleExportCSV}>Export CSV</Button>
            </div>
          )}

          {view === "table" ? (
            <>
              <div className="section-title">
                <TableChartIcon style={{ color: 'var(--primary)' }} /> Transactions Table
              </div>
              <div className="dashboard-grid">
                <TableData data={filteredTransactions} user={cUser} />
              </div>
            </>
          ) : (
            <>
              <div className="section-title">
                <InsightsIcon style={{ color: 'var(--primary)' }} /> Analytics & Insights
              </div>
              <div className="dashboard-grid">
                <Analytics transactions={filteredTransactions} user={cUser} type={type} />
              </div>
            </>
          )}
          <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
              <Modal.Title>Add New Transaction</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formTitle">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    name="title"
                    type="text"
                    placeholder="Enter title"
                    value={values.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formAmount">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    name="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={values.amount}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    name="description"
                    type="text"
                    placeholder="Enter description"
                    value={values.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formCategory">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={values.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose...</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Rent">Rent</option>
                    <option value="Salary">Salary</option>
                    <option value="Tip">Tip</option>
                    <option value="Food">Food</option>
                    <option value="Medical">Medical</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formTransactionType">
                  <Form.Label>Transaction Type</Form.Label>
                  <Form.Select
                    name="transactionType"
                    value={values.transactionType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose...</option>
                    <option value="credit">Credit</option>
                    <option value="expense">Expense</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formDate">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    name="date"
                    type="date"
                    value={values.date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formRecurring">
                  <Form.Check
                    type="checkbox"
                    label="Make this a recurring transaction?"
                    name="isRecurring"
                    checked={values.isRecurring}
                    onChange={handleChange}
                  />
                </Form.Group>
                {values.isRecurring && (
                  <Form.Group className="mb-3" controlId="formRecurringFrequency">
                    <Form.Label>Repeat every:</Form.Label>
                    <Form.Select
                      name="recurringFrequency"
                      value={values.recurringFrequency}
                      onChange={handleChange}
                    >
                      <option value="daily">Day</option>
                      <option value="weekly">Week</option>
                      <option value="monthly">Month</option>
                    </Form.Select>
                  </Form.Group>
                )}
                <div className="d-flex justify-content-end">
                  <Button variant="secondary" onClick={handleClose} className="me-2">Close</Button>
                  <Button variant="primary" type="submit" disabled={loading}>{loading ? "Saving..." : "Submit"}</Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
          <ToastContainer />
        </Container>
      )}
    </div>
  );
};

export default Home;
