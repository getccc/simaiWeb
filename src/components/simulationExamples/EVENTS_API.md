## 概览

`/events` 提供仿真运行过程中的结构化事件流，前端可根据事件驱动动画与状态更新。建议前端使用增量拉取（since_id）方式获取新增事件。

- 接口：`GET /events?since_id=0&limit=500`
- 入参：
  - `since_id`：仅返回事件 `id > since_id` 的增量事件（默认 0 返回最早可用）
  - `limit`：本次返回事件的最大数量（默认 500，最大 2000）
- 返回：
  - `since_id`：请求中携带的 since_id 原样返回
  - `events`：事件数组（按产生顺序）
  - `last_event_id`：当前服务缓存中最新事件的 id

## 事件对象通用字段

- `id`：事件自增唯一标识（服务端注入，用于增量拉取与去重）
- `server_time`：服务端接收事件的实时时间戳（秒，float）
- `type`：事件类型（详见下文）
- `sim_time`：仿真时间（分钟，float），用于在前端以仿真时序驱动动画
- `wafer_id`：晶圆 ID（整机流程级事件与工序级事件均携带）

> 说明：除上述通用字段，以下不同类型事件还会包含各自的特定字段。

## 事件类型与字段说明

### wafer_arrival（晶圆到达并入盒）
- 含义：一片新晶圆生成并被放入某个 `Cassette` 的某一层。
- 额外字段：
  - `cassette_id`：晶圆盒编号
  - `layer`：层号

### process_start（晶圆流程开始）
- 含义：某片晶圆开始其整机处理流程。
- 额外字段：无

### process_complete（晶圆流程完成）
- 含义：某片晶圆完成所有步骤并返回原盒。
- 额外字段：
  - `process_time`：该片晶圆总处理时长（分钟）
  - `completed_count`：截至当前已完成的晶圆数量
  - `avg_process_time`：已完成晶圆的平均处理时长（分钟）

### transfer_start / transfer_complete（机械臂转移开始/完成）
- 含义：大气/真空机械臂执行一次晶圆搬运作业的开始与结束。
- 额外字段：
  - `from`：来源位置（如 `Cassette 1:Layer 0`、`WaferAligner`、`LoadLock`、`TransferChamber` 等）
  - `to`：目标位置
  - `equipment`：具体机械臂名称（如 `AtmosphericRobot 1`、`VacuumRobot 2`）
  - `system_type`：`atmospheric` 或 `vacuum`
  - `duration_estimate`：开始事件给出预计耗时（分钟）
  - `duration`：完成事件给出实际耗时（分钟）

### align_start / align_complete（寻边开始/完成）
- 含义：晶圆在 `WaferAligner` 上进行寻边操作的开始与结束。
- 额外字段：
  - `equipment`：`WaferAligner`
  - `duration_estimate` / `duration`：预计/实际耗时（分钟）

### pump_down_start / pump_down_complete（抽真空开始/完成）
- 含义：晶圆在 `LoadLock` 进行抽真空步骤的开始与结束。
- 额外字段：
  - `equipment`：`LoadLock`
  - `duration_estimate` / `duration`：预计/实际耗时（分钟）

### vent_start / vent_complete（充气开始/完成）
- 含义：晶圆在 `LoadLock` 进行充气步骤的开始与结束。
- 额外字段：
  - `equipment`：`LoadLock`
  - `duration_estimate` / `duration`：预计/实际耗时（分钟）

### etching_start / etching_complete（刻蚀开始/完成）
- 含义：晶圆在某个刻蚀腔室（`EtchingChamber N`）进行刻蚀工序的开始与结束。
- 额外字段：
  - `equipment`：例如 `EtchingChamber 3`
  - `duration_estimate` / `duration`：预计/实际耗时（分钟）

### cleaning_start / cleaning_complete（清洗开始/完成）
- 含义：晶圆在某个清洗腔室（`CleaningChamber N`）进行清洗工序的开始与结束。
- 额外字段：
  - `equipment`：例如 `CleaningChamber 2`
  - `duration_estimate` / `duration`：预计/实际耗时（分钟）

## 示例

```json
{
  "id": 123,
  "server_time": 1726370000.123,
  "type": "transfer_start",
  "sim_time": 10.5,
  "wafer_id": 3,
  "from": "Cassette 1:Layer 0",
  "to": "WaferAligner",
  "equipment": "AtmosphericRobot 1",
  "system_type": "atmospheric",
  "duration_estimate": 0.76
}
```

## 前端消费建议

- **增量拉取**：使用 `since_id` 记录最新消费的事件 id，定时轮询 `/events` 获取增量。
- **排序展示**：驱动动画优先按 `sim_time` 排序；如需与实时时钟贴齐可参考 `server_time`。
- **状态机映射**：
  - 机械臂搬运：`transfer_start` → 动画开始，`transfer_complete` → 动画结束并更新位置。
  - 工序处理：`*_start` → 腔室进入忙碌，`*_complete` → 腔室释放并更新计数。
  - LoadLock 与 Aligner 同理处理 `*_start/*_complete`。
- **健壮性**：若出现事件丢失或刷新，可从 `last_event_id` 回退一定量重拉，或直接将 `since_id=0` 进行全量回放（受服务端缓存大小限制）。
