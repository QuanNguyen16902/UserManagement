import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useUserRoles } from "../../../hooks/useUserRoles";
import {
  default as RoleService,
  default as roleService,
} from "../../../service/role.service";
import AccessDenied from "../../layout/Error/AccessDenied";
import "../datatable.css";
import SearchField from "../SearchField";
import AddRoleModal from "./AddRoleModal";
import EditRoleModal from "./EditRoleModal";

function Roles() {
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null); // ID của mục cần xóa
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editRoleId, setEditRoleId] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const { userRoles, groupRoles } = useUserRoles();
  // Kiểm tra nếu "ROLE_ADMIN" có trong cả userRoles và groupRoles
  const canView = [...userRoles, ...groupRoles].includes("ROLE_ADMIN");

  // Fetch users with optional search keyword
  const fetchRoles = async (keyword = "") => {
    setLoading(true);
    try {
      let response;
      if (keyword) {
        response = await roleService.searchRoles(keyword);
        setSearchResults(response.data);
      } else {
        response = await roleService.getRoles();
        setData(response.data);
        setSearchResults([]); // Clear search results when fetching all users
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async () => {
    try {
      await RoleService.deleteRole(deleteId); // Gọi API xóa role
      setData(data.filter((item) => item.id !== deleteId));
      toast.success("Xóa thành công!"); // Hiển thị thông báo thành công
    } catch (error) {
      let errorMessage = "Đã xảy ra lỗi!";

      if (error.response) {
        errorMessage = error.response.data?.message || "Có lỗi xảy ra!";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setOpenDelete(false);
    }
  };

  const handleDeleteRole = (roleId) => {
    setDeleteId(roleId);
    setOpenDelete(true);
  };

  const handleClose = () => {
    setOpenDelete(false);
    setOpenEdit(false);
  };

  // Xử lý edit dialog
  const handleEditRole = (roleId) => {
    setEditRoleId(roleId);
    setOpenEdit(true);
  };
  // Xử lý search
  const handleSearch = (keyword) => {
    fetchRoles(keyword);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Tên", width: 150 },
    { field: "link", headerName: "Link", width: 150 },
    { field: "description", headerName: "Mô tả", width: 230 },
  ];

  // Transforming the data to match the DataGrid's expected format
  const rows = (searchResults.length > 0 ? searchResults : data).map(
    (item) => ({
      id: item.id,
      name: item.name,
      link: item.link,
      description: item.description,
    })
  );

  const actionColumn = [
    {
      field: "action",
      headerName: "Hành động",
      width: 200,
      renderCell: (params) => (
        <div className="cellAction">
          <button
            style={{
              textDecoration: "none",
              border: "none",
              background: "none",
            }}
            onClick={() => handleEditRole(params.row.id)}
          >
            <div className="viewButton">
              <i className="bi bi-pencil-square"></i>
            </div>
          </button>
          <div
            className="deleteButton"
            onClick={() => handleDeleteRole(params.row.id)}
          >
            <i className="bi bi-trash"></i>
          </div>
        </div>
      ),
    },
  ];
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
  if (!canView) {
    return <AccessDenied />;
  }
  return (
    <div className="datatable">
      <div className="datatableTitle">
        Danh sách Vai trò
        <SearchField label={"Tra cứu Quyền"} onSearch={handleSearch} />
        <button className="link" onClick={() => setOpenAdd(true)}>
          <i className="bi bi-person-add hover"></i>&nbsp;
          <span>Thêm</span>
        </button>
        <AddRoleModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onAddRole={fetchRoles}
        />
      </div>
      <DataGrid
        className="datagrid"
        rows={rows}
        columns={columns.concat(actionColumn)}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5]}
        onSelectionModelChange={(ids) => {
          setSelectedRows(ids);
        }}
        disableRowSelectionOnClick
      />

      <Dialog
        open={openDelete}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">{"Xác nhận xóa"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa quyền có <b>ID {deleteId}</b>? Hành động
            này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy bỏ</Button>
          <Button onClick={handleDelete} autoFocus>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
      {openEdit && (
        <EditRoleModal
          open={openEdit}
          onClose={handleClose}
          roleId={editRoleId}
          onEditRole={fetchRoles}
        />
      )}
    </div>
  );
}

export default Roles;
