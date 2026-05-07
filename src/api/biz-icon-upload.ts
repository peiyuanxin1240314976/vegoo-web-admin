/**
 * 全站可复用：业务图标上传（multipart `file` + query `iconKey`）。
 * 各页面在提交前调用 `fetchUploadBizIcon(file, iconKey)`，iconKey 常用 `useRoute().name` 字符串。
 * 类型与实现仅此文件，勿在各业务 `src/api` 中再包一层单页专用上传方法。
 */
import request from '@/utils/http'

/** `POST /api/v1/datacenter/biz/icon/upload` 解包后的业务体 */
export interface BizIconUploadData {
  contentType: string
  downloadUrl: string
  iconKey: string
  iconName: string
  /** 字节大小（与分页字段 `size` 语义不同，仅本接口响应体） */
  size: number
}

export function fetchUploadBizIcon(file: File, iconKey: string) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<BizIconUploadData>({
    url: '/api/v1/datacenter/biz/icon/upload',
    params: { iconKey: iconKey || '' },
    data: formData,
    showErrorMessage: false
  })
}
