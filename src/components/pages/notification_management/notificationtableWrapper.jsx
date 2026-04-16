"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DynamicTable from "@/components/common/NotificationTable";
import { useNotifications } from "@/hooks/useNotifications";
import { useGroups } from "@/hooks/useGroups";
const NotificationTableWrapper = () => {
  const router = useRouter();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const { data: groupsData, isLoading: groupsLoading } = useGroups();
  const groups = groupsData?.data?.groups || [];
  const groupMap = useMemo(() => {
    const map = {};
    groups.forEach((g) => {
      map[g.group_id] = g.group_name || `Group ${g.group_id}`;
    });
    return map;
  }, [groups]);

  const apiParams = useMemo(() => {
    const params = {};

    params.page = String(pagination.pageIndex + 1);
    params.per_page = String(pagination.pageSize);

    if (searchValue?.trim()) {
      params.q = searchValue.trim();
    }

    columnFilters.forEach((filter) => {
      if (filter.value) {
        params[filter.id] = String(filter.value);
      }
    });

    if (fromDate) {
      params.from_date = fromDate.format("YYYY-MM-DD HH:mm:ss");
    }
    if (toDate) {
      params.to_date = toDate.format("YYYY-MM-DD HH:mm:ss");
    }

    if (sorting.length > 0) {
      params.sort_by = sorting[0].id;
      params.sort_order = sorting[0].desc ? "desc" : "asc";
    }

    return params;
  }, [pagination, columnFilters, sorting, searchValue, fromDate, toDate]);

  const {
    data: notificationsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useNotifications(apiParams, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });

  const notifications = notificationsResponse?.data?.items || [];
  const totalRowCount = notificationsResponse?.data?.pagination?.total || 0;

  const columns = [
    { accessorKey: "title", header: "Title", size: 150, enableSorting: false },

    {
      accessorKey: "category",
      header: "Category",
      size: 120,
      filterVariant: "select",
      filterSelectOptions: [
        { label: "PROMOTIONAL", value: "PROMOTIONAL" },
        { label: "SYSTEM", value: "SYSTEM" },
      ],
      enableSorting: false,
    },
    {
      id: "groups",
      header: "Groups",
      size: 200,
      enableSorting: false,
      Cell: ({ row }) => {
        const groupIds = row.original.group_ids || [];
        if (groupIds.length === 0) return "-";

        return (
          <div className="flex flex-wrap gap-1">
            {groupIds.map((id) => (
              <span
                key={id}
                className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
              >
                {groupMap[id] || `ID ${id}`}
              </span>
            ))}
          </div>
        );
      },
    },

    {
      accessorKey: "created_date_time",
      header: "Created At",
      size: 180,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value ? new Date(value).toLocaleString() : "-";
      },
      enableSorting: false,
    },
  ];

  const rowActions = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      label: "View",
      onClick: (row) => router.push(`/notification_management/view/${row.id}`),
      color: "info",
    },
    {
      icon: <EditIcon fontSize="small" />,
      label: "Edit",
      onClick: (row) => router.push(`/notification_management/edit/${row.id}`),
      color: "primary",
    },
  ];
  const handleAddNew = () => router.push("/notification_management/create");

  return (
    <>
      <DynamicTable
        createButtonLabel="Create Notification"
        onCreate={handleAddNew}
        enableColumnOrdering={false}
        data={notifications}
        columns={columns}
        rowActions={rowActions}
        showCreateButton={true}
        isLoading={isLoading || isFetching}
        isError={isError}
        error={error}
        refetch={refetch}
        enableServerSide
        onPaginationChange={setPagination}
        onColumnFiltersChange={setColumnFilters}
        onSortingChange={setSorting}
        pagination={pagination}
        columnFilters={columnFilters}
        sorting={sorting}
        totalRowCount={totalRowCount}
        startDate={fromDate}
        endDate={toDate}
        onStartDateChange={setFromDate}
        onEndDateChange={setToDate}
        muiTableProps={{
          enableColumnFilters: true,
          enablePagination: true,
          enableSorting: true,
        }}
      />
    </>
  );
};

export default NotificationTableWrapper;
