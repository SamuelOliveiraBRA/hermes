import sys
sys.path.append("..")
from toolbox import Toolbox

def test_telemetry_access():
    tb = Toolbox()
    res = tb.tool_get_telemetry()
    assert "Mac Mini M4" in res

def test_memory_recall():
    tb = Toolbox()
    tb.tool_remember(key="test_qa", value="active")
    res = tb.tool_recall(key="test_qa")
    assert "active" in str(res)
