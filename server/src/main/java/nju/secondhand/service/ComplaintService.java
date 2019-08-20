package nju.secondhand.service;


import nju.secondhand.vo.ComplaintVO;

import java.util.List;

/**
 * @author cst
 */
public interface ComplaintService {
    /**
     * <p>获取用户投诉（分页）</p>
     *
     * @param keyword   关键词
     * @param lastIndex 之前总共查询到的数量
     * @param size      本次查询数量
     * @param timestamp 时间戳
     * @return {@link ComplaintVO}
     */
    List<ComplaintVO> getComplaints(String keyword, int lastIndex, int size, long timestamp);

    /**
     * <p>处理投诉</p>
     *
     * @param complaintID 投诉 ID
     * @param result      处理结果
     */
    void handle(String complaintID, String result);
}
