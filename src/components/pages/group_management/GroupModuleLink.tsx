"use client";

import * as React from "react";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";

// Sample user names
const modules = [
  "Dashboard",
  "Users",
  "Profile",
  "Password",
  "Reports",
  "Analytics",
  "Settings",
  "Notifications",
  "Billing",
  "Support",
];

function not(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => !b.includes(value));
}

function intersection(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => b.includes(value));
}

function union(a: readonly number[], b: readonly number[]) {
  return [...a, ...not(b, a)];
}

export default function SelectAllTransferList() {
  const [checked, setChecked] = React.useState<readonly number[]>([]);
  const [left, setLeft] = React.useState<readonly number[]>([0, 1, 2, 3, 4]);
  const [right, setRight] = React.useState<readonly number[]>([5, 6, 7, 8, 9]);

  const [leftSearch, setLeftSearch] = React.useState("");
  const [rightSearch, setRightSearch] = React.useState("");

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items: readonly number[]) =>
    intersection(checked, items).length;

  const handleToggleAll = (items: readonly number[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (
    title: React.ReactNode,
    items: readonly number[],
    searchValue: string,
    setSearchValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const filteredItems = items.filter((idx) =>
      modules[idx]?.toLowerCase().includes(searchValue.toLowerCase())
    );


    return (
      <Card sx={{ minWidth: 260, borderRadius: 3 }}>
        <CardHeader
          sx={{ px: 2, py: 1, bgcolor: "#ebebe5" }}
          avatar={
            <Checkbox
              onClick={handleToggleAll(items)}
              checked={
                numberOfChecked(items) === items.length && items.length !== 0
              }
              indeterminate={
                numberOfChecked(items) !== items.length &&
                numberOfChecked(items) !== 0
              }
              disabled={items.length === 0}
              inputProps={{
                "aria-label": "all items selected",
              }}
            />
          }
          titleTypographyProps={{ variant: "h6" }}
          title={title}
          subheader={`${numberOfChecked(items)}/${items.length} selected`}
        />
        <Divider />
        <TextField
          placeholder="Search..."
          variant="outlined"
          size="small"
          fullWidth
          sx={{ p: 1 }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <Divider />
        <List
          sx={{
            width: "100%",
            height: 280,
            bgcolor: "background.paper",
            overflow: "auto",
          }}
          dense
          component="div"
          role="list"
        >
          {filteredItems.map((value: number) => {
            const labelId = `transfer-list-all-item-${value}-label`;
            const name = modules[value]?.toString() ?? "";


            return (
              <ListItemButton
                key={value}
                role="listitem"
                onClick={handleToggle(value)}
                sx={{
                  "&:hover": { bgcolor: "#f2f4f7" },
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={checked.includes(value)}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{
                      "aria-labelledby": labelId,
                    }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={name} />
              </ListItemButton>
            );
          })}
        </List>
      </Card>
    );
  };

  return (
    <div className="mr-auto w-fit rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <Grid
        container
        spacing={2}
        sx={{ justifyContent: "center", alignItems: "center", mt: 4 }}
      >
        <Grid>
          {customList("Available modules", left, leftSearch, setLeftSearch)}
        </Grid>
        <Grid>
          <Grid container direction="column" sx={{ alignItems: "center" }}>
            <Button
              sx={{ my: 0.5 }}
              variant="contained"
              size="small"
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              aria-label="move selected right"
            >
              &gt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="contained"
              size="small"
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              aria-label="move selected left"
            >
              &lt;
            </Button>
          </Grid>
        </Grid>
        <Grid>
          {customList("Selected modules", right, rightSearch, setRightSearch)}
        </Grid>
      </Grid>
    </div>
  );
}
